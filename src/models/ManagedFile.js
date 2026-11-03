import mongoose from 'mongoose';

/**
 * Admin-managed site files served/written from the dashboard:
 *   robots.txt, llms.txt, .htaccess
 * Stored in MongoDB (with a JSON fallback on disk) so they can be edited live
 * from /admin/site-files without a redeploy.
 */
const ManagedFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true, // 'robots.txt' | 'llms.txt' | '.htaccess'
    },
    content: {
      type: String,
      default: '',
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
  delete mongoose.models.ManagedFile;
}

export default mongoose.models.ManagedFile || mongoose.model('ManagedFile', ManagedFileSchema);
