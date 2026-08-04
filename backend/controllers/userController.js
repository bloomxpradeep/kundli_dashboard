const supabaseAdmin = require('../config/supabase');

exports.getDashboard = async (req, res) => {
  try {
    const [transRes, astrologerRes, ordersRes] = await Promise.all([
      supabaseAdmin.from('credit_transactions').select('*').eq('astrologer_id', req.user.id).neq('type', 'deduct').order('created_at', { ascending: false }),
      supabaseAdmin.from('astrologers').select('credits_balance, balance_after').eq('id', req.user.id).single(),
      supabaseAdmin.from('sheet_orders').select('*').order('created_at', { ascending: false })
    ]);

    const transactionsWithBalance = transRes.data || [];
    const creditsUsed = parseInt(astrologerRes.data?.balance_after || '0', 10) - parseInt(astrologerRes.data?.credits_balance || '0', 10);

    res.status(200).json({
      transactions: transactionsWithBalance,
      companySettings: { 
        total_credits: parseInt(astrologerRes.data?.credits_balance || '0', 10),
        credits_used: creditsUsed >= 0 ? creditsUsed : 0
      }, 
      orders: ordersRes.data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
