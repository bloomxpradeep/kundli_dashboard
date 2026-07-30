const supabaseAdmin = require('../config/supabase');

exports.getDashboard = async (req, res) => {
  try {
    const [transRes, astrologerRes, ordersRes] = await Promise.all([
      supabaseAdmin.from('credit_transactions').select('*').eq('astrologer_id', req.user.id).order('created_at', { ascending: false }),
      supabaseAdmin.from('astrologers').select('credits_balance, balance_after').eq('id', req.user.id).single(),
      supabaseAdmin.from('sheet_orders').select('*').order('created_at', { ascending: false })
    ]);

    const transactionsWithBalance = transRes.data || [];

    res.status(200).json({
      transactions: transactionsWithBalance,
      companySettings: { total_credits: parseInt(astrologerRes.data?.balance_after || '0', 10) }, 
      orders: ordersRes.data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
