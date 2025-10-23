const mongoose = require('mongoose');
const crypto = require('crypto');

const staffInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    photoUrl: { type: String, default: '' },

    passwordHash: { type: String, default: '' },

    token: { type: String, index: true },
    status: { type: String, enum: ['sent', 'verified', 'approved', 'cancelled'], default: 'sent', index: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    approvedAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // New fields for enhanced staff invitation
    staffId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['field_staff', 'delivery_staff', 'manager', 'admin', 'lab_staff', 'accountant'], default: 'field_staff' },
    
    // Document uploads
    documents: [{
      type: { type: String, enum: ['id_proof', 'license', 'certificate', 'other'] },
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Registration completion tracking
    registrationCompleted: { type: Boolean, default: false },
    registrationCompletedAt: Date
  },
  { timestamps: true }
);

staffInviteSchema.statics.generateToken = function generateToken() {
  return crypto.randomBytes(24).toString('hex');
};

module.exports = mongoose.model('StaffInvite', staffInviteSchema);

// Ensure non-ObjectId invitedBy (e.g., 'builtin-admin') does not break validation
staffInviteSchema.pre('validate', function(next) {
  if (this.invitedBy && !mongoose.isValidObjectId(this.invitedBy)) {
    this.invitedBy = undefined;
  }
  next();
});


