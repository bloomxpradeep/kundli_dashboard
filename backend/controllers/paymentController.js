const razorpay = require('../config/razorpay');
const supabaseAdmin = require('../config/supabase');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        astrologer_id: req.user.id,
        credits: amount // since 1 INR = 1 credit in this logic
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, credits } = req.body;
    
    // 1. Verify Signature securely on the backend
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // 2. Signature is valid! Check for idempotency (has this payment been processed?)
    const { data: existingTx } = await supabaseAdmin
      .from('credit_transactions')
      .select('id')
      .eq('payment_id', razorpay_payment_id)
      .single();

    if (existingTx) {
      // Payment already processed (e.g. by webhook), return success without double-charging credits
      return res.status(200).json({ message: 'Payment already processed and verified' });
    }

    // 3. Allocate credits
    const parsedCredits = parseInt(credits);

    const { data: astrologerData, error: fetchError } = await supabaseAdmin
      .from('astrologers')
      .select('credits_balance')
      .eq('id', req.user.id)
      .single();

    if (fetchError) throw fetchError;
    
    const newBalance = (astrologerData?.credits_balance || 0) + parsedCredits;

    // 2. Log transaction FIRST (Safer to do this first so we can roll back if balance update fails)
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        astrologer_id: req.user.id,
        type: 'assign', // Must be assign, deduct, refund, or adjust as per SQL check constraint
        amount: parsedCredits,
        total_credits_assigned: parsedCredits,
        payment_id: razorpay_payment_id,
        note: `Purchased via Razorpay`,
        created_by: 'system'
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
      .eq('id', req.user.id);

    if (updateError) {
      // Rollback the transaction log since the balance didn't update
      await supabaseAdmin.from('credit_transactions').delete().eq('id', transaction.id);
      throw updateError;
    }

    res.status(200).json({ message: 'Payment verified and credits added', newTotal: newBalance });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // We must use the raw body buffer to verify the webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Since we used raw body parser, we need to parse it to JSON now that it's verified
    const payload = JSON.parse(req.body.toString());

    // We only care about payment captured events
    if (payload.event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpay_payment_id = paymentEntity.id;
      
      const { astrologer_id, credits } = paymentEntity.notes || {};
      
      if (!astrologer_id || !credits) {
        // This payment might not have been created by our system or missing metadata
        return res.status(200).json({ message: 'Missing metadata, ignoring' });
      }

      // 1. Idempotency Check
      const { data: existingTx } = await supabaseAdmin
        .from('credit_transactions')
        .select('id')
        .eq('payment_id', razorpay_payment_id)
        .single();

      if (existingTx) {
        return res.status(200).json({ message: 'Payment already processed' });
      }

      // 2. Process credits
      const parsedCredits = parseInt(credits);

      const { data: astrologerData, error: fetchError } = await supabaseAdmin
        .from('astrologers')
        .select('credits_balance')
        .eq('id', astrologer_id)
        .single();

      if (fetchError) throw fetchError;
      
      const newBalance = (astrologerData?.credits_balance || 0) + parsedCredits;

      // 3. Log transaction FIRST
      const { data: transaction, error: transactionError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          astrologer_id: astrologer_id,
          type: 'assign',
          amount: parsedCredits,
          total_credits_assigned: parsedCredits,
          payment_id: razorpay_payment_id,
          note: `Purchased via Razorpay (Webhook)`,
          created_by: 'system'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 4. Update balance SECOND
      const { error: updateError } = await supabaseAdmin
        .from('astrologers')
        .update({ 
          credits_balance: newBalance
        })
        .eq('id', astrologer_id);

      if (updateError) {
        // Rollback
        await supabaseAdmin.from('credit_transactions').delete().eq('id', transaction.id);
        throw updateError;
      }
    }

    // Respond OK so Razorpay knows we received it
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
};
