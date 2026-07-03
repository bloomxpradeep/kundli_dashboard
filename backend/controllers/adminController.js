const supabaseAdmin = require('../config/supabase');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;
    
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format username to always be an email-like string for users created via the dashboard
    let processedUsername = username.toLowerCase().trim();
    if (!processedUsername.includes('@')) {
      processedUsername = `${processedUsername}@kundli.com`;
    }

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Insert into astrologers directly
    const { data: newUser, error: profileError } = await supabaseAdmin.from('astrologers').insert({
      name: fullName,
      username: processedUsername,
      password_hash: password_hash,
      credits_balance: 0
    }).select().single();

    if (profileError) {
      console.error('Astrologer insert error:', profileError);
      throw profileError;
    }

    res.status(200).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error in /api/admin/users/create:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.allocateCredits = async (req, res) => {
  try {
    const { targetUserId, adminEmail, creditAmount, reason } = req.body;
    
    if (!targetUserId || !creditAmount || isNaN(creditAmount)) {
      return res.status(400).json({ error: 'Invalid credit amount or missing user ID' });
    }

    const amount = parseInt(creditAmount);

    // 1. Get current user credits
    const { data: astrologerData, error: fetchError } = await supabaseAdmin
      .from('astrologers')
      .select('credits_balance')
      .eq('id', targetUserId)
      .single();

    if (fetchError) throw fetchError;
    
    const newBalance = (astrologerData?.credits_balance || 0) + amount;

    // 2. Log transaction FIRST (Safer to do this first so we can roll back if balance update fails)
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        astrologer_id: targetUserId,
        type: 'assign',
        amount: amount,
        total_credits_assigned: amount,
        note: reason || 'Manual Admin Allocation',
        created_by: adminEmail || 'Admin'
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 3. Update astrologer credits SECOND
    const { error: updateError } = await supabaseAdmin
      .from('astrologers')
      .update({ 
        credits_balance: newBalance
      })
      .eq('id', targetUserId);

    if (updateError) {
      // Rollback the transaction log since the balance didn't update
      await supabaseAdmin.from('credit_transactions').delete().eq('id', transaction.id);
      throw updateError;
    }

    res.status(200).json({ message: 'Credits allocated successfully', newBalance });
  } catch (error) {
    console.error('Error in /api/admin/credits/allocate:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [usersRes, transRes, ordersRes] = await Promise.all([
      supabaseAdmin.from('astrologers').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('credit_transactions').select(`
        *,
        astrologers ( name, username )
      `).order('created_at', { ascending: false }),
      supabaseAdmin.from('kundli_orders').select('*').order('created_at', { ascending: false })
    ]);

    // Calculate global stats dynamically instead of company_settings
    // Fallback: Just calculate it based on total assigned transactions if needed
    const total_credits_assigned = (transRes.data || []).filter(t => t.type === 'assign').reduce((acc, t) => acc + (t.amount || 0), 0);
    
    console.log('DEBUG USERSRES.DATA LENGTH:', usersRes.data ? usersRes.data.length : 'NULL');
    console.log('DEBUG USERSRES.ERROR:', usersRes.error);
    
    res.status(200).json({
      users: usersRes.data || [],
      transactions: transRes.data || [],
      companySettings: { total_credits: total_credits_assigned }, // Shim for backward compatibility
      orders: ordersRes.data || []
    });
  } catch (error) {
    console.error('getDashboard catch block:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name } = req.body;
    
    const tableUpdates = {};
    if (name) tableUpdates.name = name;
    if (username) tableUpdates.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      tableUpdates.password_hash = await bcrypt.hash(password, salt);
    }
    
    if (Object.keys(tableUpdates).length > 0) {
      const { error: updateError } = await supabaseAdmin.from('astrologers').update(tableUpdates).eq('id', id);
      if (updateError) throw updateError;
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete from Astrologers table (cascades or relies on foreign key rules)
    const { error: dbError } = await supabaseAdmin.from('astrologers').delete().eq('id', id);
    if (dbError) throw dbError;

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};
