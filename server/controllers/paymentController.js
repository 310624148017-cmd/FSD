const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const Contract = require('../models/Contract');
const LedgerEntry = require('../models/LedgerEntry');

// @route  POST /api/payment/create-checkout-session
// @access Agribusiness
const createCheckoutSession = async (req, res) => {
  try {
    const { contractId, amount, type, notes } = req.body;
    
    const contract = await Contract.findById(contractId).populate('farmer');
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // In a real app, you would pass line_items correctly. Here we use a generic placeholder.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Payment for ${contract.cropType} Contract`,
              description: notes || `Payment type: ${type}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in paise (smallest currency unit)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/ledger/${contractId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/ledger/${contractId}?payment=cancel`,
      metadata: {
        contractId: contract._id.toString(),
        agribusinessId: req.user._id.toString(),
        farmerId: contract.farmer._id.toString(),
        amount: amount.toString(),
        type,
        notes: notes || '',
      }
    });

    res.json({ success: true, id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/payment/success
// @access Agribusiness
const handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.body;
    
    // Retrieve the session to make sure it was paid
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    const { contractId, amount, type, notes, agribusinessId, farmerId } = session.metadata;

    // Check if we already recorded this payment
    const existing = await LedgerEntry.findOne({ transactionReference: session_id });
    if (existing) {
      return res.json({ success: true, message: 'Payment already recorded.' });
    }

    const contract = await Contract.findById(contractId);
    
    const entry = await LedgerEntry.create({
      contract: contractId,
      agribusiness: agribusinessId,
      farmer: farmerId,
      amount: Number(amount),
      type,
      notes,
      paymentMode: 'stripe_card',
      transactionReference: session_id,
      status: 'completed'
    });

    contract.amountPaid += Number(amount);
    if (contract.amountPaid >= contract.totalValue) {
      contract.paymentStatus = 'completed';
    } else if (contract.amountPaid > 0) {
      contract.paymentStatus = 'partial';
    }
    await contract.save();

    res.json({ success: true, entry, contract });
  } catch (error) {
    console.error('Stripe success error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCheckoutSession, handlePaymentSuccess };
