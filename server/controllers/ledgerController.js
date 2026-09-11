const LedgerEntry = require('../models/LedgerEntry');
const Contract = require('../models/Contract');

// @route  POST /api/ledger
// @access Agribusiness
const recordPayment = async (req, res) => {
  try {
    const { contractId, amount, type, notes, paymentMode, transactionReference } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (!contract.farmer) {
      return res.status(400).json({ success: false, message: 'No farmer assigned to this contract.' });
    }

    const entry = await LedgerEntry.create({
      contract: contractId,
      agribusiness: req.user._id,
      farmer: contract.farmer,
      amount,
      type,
      notes,
      paymentMode: paymentMode || 'bank_transfer',
      transactionReference: transactionReference || '',
    });

    // Update amountPaid on contract and adjust paymentStatus
    contract.amountPaid += amount;
    if (contract.amountPaid >= contract.totalValue) {
      contract.paymentStatus = 'completed';
    } else if (contract.amountPaid > 0) {
      contract.paymentStatus = 'partial';
    }
    await contract.save();

    res.status(201).json({ success: true, entry, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/ledger/contract/:contractId
// @access Private
const getContractLedger = async (req, res) => {
  try {
    const entries = await LedgerEntry.find({ contract: req.params.contractId })
      .populate('agribusiness', 'name email')
      .populate('farmer', 'name email')
      .sort({ transactionDate: -1 });

    res.json({ success: true, count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/ledger/summary/:contractId
// @access Private
const getPaymentSummary = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    const totalPaid = contract.amountPaid;
    const outstanding = Math.max(0, contract.totalValue - totalPaid);
    const percentPaid = contract.totalValue > 0 ? ((totalPaid / contract.totalValue) * 100).toFixed(1) : '0.0';

    res.json({
      success: true,
      summary: {
        totalValue: contract.totalValue,
        totalPaid,
        outstanding,
        percentPaid,
        paymentStatus: contract.paymentStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/ledger
// @access Agribusiness
const getAllPayments = async (req, res) => {
  try {
    const entries = await LedgerEntry.find({ agribusiness: req.user._id })
      .populate('contract', 'title cropType')
      .populate('farmer', 'name email')
      .sort({ transactionDate: -1 });

    res.json({ success: true, count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/ledger/:id/status
// @access Agribusiness
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const entry = await LedgerEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Ledger entry not found.' });
    if (entry.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    entry.status = status;
    await entry.save();

    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { recordPayment, getContractLedger, getPaymentSummary, getAllPayments, updatePaymentStatus };
