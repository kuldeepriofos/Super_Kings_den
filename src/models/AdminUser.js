import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'editor', 'author', 'viewer'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    permissions: {
      managePosts: { type: Boolean, default: true },
      managePlayers: { type: Boolean, default: true },
      manageMatches: { type: Boolean, default: true },
      manageMedia: { type: Boolean, default: true },
      manageRedirects: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
    },
    lastLogin: { type: Date },
    lastLoginIp: { type: String, default: '' },
    loginCount: { type: Number, default: 0 },
    createdBy: { type: String, default: 'system' },
  },
  {
    timestamps: true,
  }
);

// Only clear the cached model during development hot-reloads so schema edits
// apply; never recompile the schema on every import in production.
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.AdminUser;
}

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);
