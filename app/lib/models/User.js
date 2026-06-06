import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,         // no two users with same email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Not required — Google OAuth users won't have a password
  },
  image: String,          // profile picture from Google

  // Which workspace this user belongs to
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },

  // Their role inside the workspace
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member'
  },

}, { timestamps: true }); // adds createdAt, updatedAt automatically

// Prevent overwriting the model in development (Next.js hot reload issue)
export default mongoose.models.User || mongoose.model('User', UserSchema);