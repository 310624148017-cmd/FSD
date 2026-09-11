const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    agribusiness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    type: {
      type: String,
      enum: ['advance', 'milestone', 'final', 'penalty'],
      required: [true, 'Payment type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'processed',
    },
    notes: {
      type: String,
      default: '',
    },
    paymentMode: {
      type: String,
      enum: ['upi', 'bank_transfer', 'neft', 'rtgs', 'cheque', 'cash'],
      default: 'bank_transfer',
      required: true,
    },
    transactionReference: {
      type: String,
      default: '',  // UPI ID / UTR / Cheque No. / Reference
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
