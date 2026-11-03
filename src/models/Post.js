import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    category: { type: String, default: 'CSK News', index: true },
    franchise: { type: String, default: 'CSK', index: true },
    author: { type: String, default: 'Super Kings Den Team' },
    date: { type: String },
    publishedAt: { type: Date, index: true },
    modified: { type: String },
    readingTime: { type: String, default: '3 min read' },
    // `views` is the legacy display string (e.g. "1.2K"); `viewCount` is the
    // real, sortable/aggregatable counter incremented on article view.
    views: { type: mongoose.Schema.Types.Mixed, default: '1.2K' },
    viewCount: { type: Number, default: 0, index: true },
    featuredImage: { type: String, default: '' },
    remoteImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    seoTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    focusKeywords: { type: String, default: '', trim: true },
    robots: {
      type: String,
      default: 'index, follow',
    },
    ogTitle: { type: String, default: '', trim: true },
    ogDescription: { type: String, default: '', trim: true },
    ogImage: { type: String, default: '' },
    schemaType: {
      type: String,
      default: 'NewsArticle',
      enum: ['NewsArticle', 'BlogPosting', 'Article'],
    },
    customSchema: { type: String, default: '' },
    isPublished: { type: Boolean, default: true, index: true },
    isMostViewed: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Add text search index across title, excerpt, and content
PostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
PostSchema.index({ publishedAt: -1, id: -1 });

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Post;
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
