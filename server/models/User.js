const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'agribusiness'],
      required: [true, 'Role is required'],
    },
    profile: {
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      cropSpecialties: { type: [String], default: [] },
      companyName: { type: String, default: '' },
      bio: { type: String, default: '' },
    },
    profilePicture: {
      type: String,
      default: '',
    },
    aadhaar: {
      maskedNumber: { type: String, default: '' },   // "XXXX-XXXX-1234"
      lastFour: { type: String, default: '' },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      otp: { type: String, select: false },          // Hidden from queries
      otpExpiry: { type: Date, select: false },
    },
  },
  { timestamps: true }
);

// Hash password before save (Mongoose 8: async hooks must not use `next`)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password to hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
