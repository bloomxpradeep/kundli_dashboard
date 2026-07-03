const supabaseAdmin = require('../config/supabase');

exports.getDashboard = async (req, res) => {
  try {
    const [transRes, astrologerRes, ordersRes] = await Promise.all([
      supabaseAdmin.from('credit_transactions').select('*').eq('astrologer_id', req.user.id).order('created_at', { ascending: false }),
      supabaseAdmin.from('astrologers').select('credits_balance').eq('id', req.user.id).single(),
      supabaseAdmin.from('kundli_orders').select('*').order('created_at', { ascending: false })
    ]);

    res.status(200).json({
      transactions: transRes.data || [],
      companySettings: { total_credits: astrologerRes.data?.credits_balance || 0 }, // We keep the companySettings key so the frontend doesn't break, but map it to individual credits
      orders: ordersRes.data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
