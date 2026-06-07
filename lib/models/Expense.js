import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({

  // Which workspace this expense belongs to
  // Every query will filter by this — most important field
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true           // ← add index, we query by this constantly
  },

  // Who submitted this expense
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    required: true,
    enum: [
      'Travel',
      'Food & Drinks',
      'Software',
      'Office Supplies',
      'Marketing',
      'Utilities',
      'Other'
    ]
  },

  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Cloudinary URL — stored after upload
  receiptUrl: {
    type: String,
    default: null
  },

  // Cloudinary public_id — needed to delete the image later
  receiptPublicId: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'    // every new expense starts as pending
  },

  // Admin fills these when approving or rejecting
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  reviewNote: {
    type: String,
    default: ''
  },

  reviewedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

// Compound index — when we query "all expenses for workspace X in month Y"
// MongoDB uses this index instead of scanning the whole collection
ExpenseSchema.index({ workspaceId: 1, date: -1 });
ExpenseSchema.index({ workspaceId: 1, status: 1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);