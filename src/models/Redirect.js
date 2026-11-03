import mongoose from 'mongoose';

const RedirectSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      required: true,
      enum: [301, 302, 307, 308],
      default: 301,
    },
    matchType: {
      type: String,
      enum: ['exact', 'prefix', 'regex'],
      default: 'exact',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastHitAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick active source lookups
RedirectSchema.index({ source: 1, isActive: 1 });

export default mongoose.models.Redirect || mongoose.model('Redirect', RedirectSchema);
