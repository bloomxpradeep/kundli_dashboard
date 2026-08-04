const supabaseAdmin = require('../config/supabase');

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

exports.getDashboard = async (req, res) => {
  try {
    const [transRes, astrologerRes, allOrders] = await Promise.all([
      supabaseAdmin.from('credit_transactions').select('*').eq('astrologer_id', req.user.id).neq('type', 'deduct').order('created_at', { ascending: false }),
      supabaseAdmin.from('astrologers').select('credits_balance, balance_after').eq('id', req.user.id).single(),
      fetchAllOrders()
    ]);

    const transactionsWithBalance = transRes.data || [];
    const creditsUsed = parseInt(astrologerRes.data?.balance_after || '0', 10) - parseInt(astrologerRes.data?.credits_balance || '0', 10);

    res.status(200).json({
      transactions: transactionsWithBalance,
      companySettings: { 
        total_credits: parseInt(astrologerRes.data?.credits_balance || '0', 10),
        credits_used: creditsUsed >= 0 ? creditsUsed : 0
      }, 
      orders: allOrders || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
