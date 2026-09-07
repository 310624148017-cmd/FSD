const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contract title is required'],
      trim: true,
    },
    agribusiness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    requiredQuantityTons: {
      type: Number,
      required: [true, 'Required quantity is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    pricePerTon: {
      type: Number,
      required: [true, 'Price per ton is required'],
      min: [0.01, 'Price must be positive'],
    },
    totalValue: {
      type: Number,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    terms: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'active', 'completed', 'declined', 'cancelled'],
      default: 'open',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-compute totalValue before save (Mongoose 8: hooks must not use `next`)
contractSchema.pre('save', function () {
  this.totalValue = this.requiredQuantityTons * this.pricePerTon;
});

module.exports = mongoose.model('Contract', contractSchema);
