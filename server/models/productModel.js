const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    // Product type (three types expected; keeping flexible until exact names provided)
    type: { type: String, required: true, trim: true },
    // Category indicates where it belongs: center or shop
    category: { type: String, enum: ['center', 'shop'], required: true },
    imageUrl: { type: String, default: '' },
    attributes: { type: Object, default: {} }, // e.g., { size: 'M', color: 'Black' }
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);