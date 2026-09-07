const mongoose = require('mongoose');

const cropUpdateSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekNumber: {
      type: Number,
      required: [true, 'Week number is required'],
      min: 1,
    },
    cropHealth: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
      required: [true, 'Crop health is required'],
    },
    estimatedYieldTons: {
      type: Number,
      required: [true, 'Estimated yield is required'],
      min: 0,
    },
    weatherCondition: {
      type: String,
      required: [true, 'Weather condition is required'],
      trim: true,
    },
    weatherImpact: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    notes: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CropUpdate', cropUpdateSchema);
