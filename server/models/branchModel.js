const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    contact: {
      phone: String,
      email: String,
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    type: {
      type: String,
      enum: ['factory', 'warehouse', 'office', 'processing_unit'],
      default: 'factory'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    },
    financialSettings: {
      gstNumber: String,
      panNumber: String,
      bankAccount: {
        accountNumber: String,
        ifscCode: String,
        bankName: String
      }
    },
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

branchSchema.index({ code: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ type: 1 });

module.exports = mongoose.model('Branch', branchSchema);

