import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true         // removes extra spaces
  },

  // The user who created it — they are always admin
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Monthly budget limit the admin sets
  monthlyBudget: {
    type: Number,
    default: 0
  },

  // Invite tokens that are currently active
  // We store them here so we can validate when someone clicks the link
  pendingInvites: [{
    email: String,
    role: { type: String, enum: ['member', 'viewer'], default: 'member' },
    token: String,            // the unique token we generate
    expiresAt: Date,          // tokens expire after 24 hours
  }]

}, { timestamps: true });

export default mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);