const supabaseAdmin = require('../config/supabase');
const bcrypt = require('bcryptjs');

const fetchAllOrders = async () => {
  let allData = [];
  let start = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('sheet_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);
    if (error) throw error;
    if (data) allData = allData.concat(data);
    if (!data || data.length < limit) break;
    start += limit;
  }
  return allData;
};

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
      .select('credits_balance, balance_after')
      .eq('id', targetUserId)
      .single();

    if (fetchError) throw fetchError;
    
    const newCreditsBalance = (astrologerData?.credits_balance || 0) + amount;
    const newBalanceAfter = parseInt(astrologerData?.balance_after || '0', 10) + amount;

    // 2. Log transaction FIRST (Safer to do this first so we can roll back if balance update fails)
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        astrologer_id: targetUserId,
        type: 'assign',
        amount: amount,
        total_credits_assigned: newCreditsBalance.toString(),
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
        credits_balance: newCreditsBalance,
        balance_after: newBalanceAfter.toString()
      })
      .eq('id', targetUserId);

    if (updateError) {
      // Rollback the transaction log since the balance didn't update
      await supabaseAdmin.from('credit_transactions').delete().eq('id', transaction.id);
      throw updateError;
    }

    res.status(200).json({ message: 'Credits allocated successfully', newBalance: newBalanceAfter });
  } catch (error) {
    console.error('Error in /api/admin/credits/allocate:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [usersRes, transRes, allOrders] = await Promise.all([
      supabaseAdmin.from('astrologers').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('credit_transactions').select(`
        *,
        astrologers ( name, username )
      `).neq('type', 'deduct').order('created_at', { ascending: false }),
      fetchAllOrders()
    ]);

    // Calculate global stats dynamically instead of company_settings
    // Calculate total credits available from the latest credits_balance of each user
    const total_credits_available = (usersRes.data || []).reduce((sum, u) => sum + parseInt(u.credits_balance || '0', 10), 0);
    const total_credits_used = (usersRes.data || []).reduce((sum, u) => sum + parseInt(u.total_credits_used || '0', 10), 0);
    
    const transactionsWithBalance = transRes.data || [];
    
    res.status(200).json({
      users: usersRes.data || [],
      transactions: transactionsWithBalance,
      companySettings: { total_credits: total_credits_available, total_credits_used: total_credits_used }, // Shim for backward compatibility
      orders: allOrders || []
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
