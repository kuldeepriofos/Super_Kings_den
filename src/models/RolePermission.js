import mongoose from 'mongoose';

const RolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ['superadmin', 'admin', 'editor', 'author', 'viewer'],
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    badgeColor: {
      type: String,
      default: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    },
    description: {
      type: String,
      default: '',
    },
    permissions: {
      managePosts: { type: Boolean, default: false },
      managePlayers: { type: Boolean, default: false },
      manageMatches: { type: Boolean, default: false },
      manageMedia: { type: Boolean, default: false },
      manageRedirects: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.RolePermission;
}

export default mongoose.models.RolePermission || mongoose.model('RolePermission', RolePermissionSchema);
