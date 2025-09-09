const mongoose = require('mongoose');

const enquiryItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const enquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [enquiryItemSchema], required: true },

    // Buyer info
    profile: {
      name: { type: String },
      email: { type: String },
      phone: { type: String, required: true },
    },
    location: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    bankingOption: {
      type: String,
      enum: ['cod', 'bank_transfer', 'razorpay'], // include online payment option
      default: 'cod',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    adminNotes: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

enquirySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);