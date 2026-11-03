import mongoose from 'mongoose';

const CustomCodeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    headCode: {
      type: String,
      default: '',
    },
    headEnabled: {
      type: Boolean,
      default: true,
    },
    bodyOpenCode: {
      type: String,
      default: '',
    },
    bodyOpenEnabled: {
      type: Boolean,
      default: true,
    },
    bodyCloseCode: {
      type: String,
      default: '',
    },
    bodyCloseEnabled: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.CustomCode;
}

export default mongoose.models.CustomCode || mongoose.model('CustomCode', CustomCodeSchema);
