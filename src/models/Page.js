import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    pageType: {
      type: String,
      enum: ['content', 'core_route'],
      default: 'content',
      index: true,
    },
    routePath: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    excerpt: {
      type: String,
      default: '',
    },
    featuredMedia: {
      type: String,
      default: '',
    },
    seoTitle: {
      type: String,
      default: '',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true,
    },
    focusKeywords: {
      type: String,
      default: '',
      trim: true,
    },
    canonicalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    robots: {
      type: String,
      enum: ['index, follow', 'noindex, nofollow', 'noindex, follow', 'index, nofollow'],
      default: 'index, follow',
    },
    ogTitle: {
      type: String,
      default: '',
      trim: true,
    },
    ogDescription: {
      type: String,
      default: '',
      trim: true,
    },
    ogImage: {
      type: String,
      default: '',
    },
    schemaType: {
      type: String,
      enum: ['WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'ItemPage', 'CollectionPage'],
      default: 'WebPage',
    },
    customSchema: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
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
  delete mongoose.models.Page;
}

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
