import mongoose from 'mongoose';

const LeadNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Inquiry',
    },
    inquiryType: {
      type: String,
      enum: ['general', 'editorial', 'partnership', 'correction', 'technical', 'other'],
      default: 'general',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'resolved', 'archived'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      default: 'contact_page',
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    notes: {
      type: [LeadNoteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Lead;
}

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
