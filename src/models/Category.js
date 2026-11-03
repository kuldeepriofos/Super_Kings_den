import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    count: { type: Number, default: 0 },
    franchise: { type: String, default: 'CSK' },
    link: { type: String, default: '' },
    parent: { type: Number, default: 0 },
    seoTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    focusKeywords: { type: String, default: '', trim: true },
    canonicalUrl: { type: String, default: '', trim: true },
    ogImage: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
