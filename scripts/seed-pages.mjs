import mongoose from 'mongoose';
import { seedPagesIfEmpty, syncSeoCacheFromDatabase } from '../src/lib/pagesManager.js';
import Page from '../src/models/Page.js';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/superkingsden';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  console.log('Running seedPagesIfEmpty...');
  const seeded = await seedPagesIfEmpty();
  console.log('Seeded result:', seeded?.length || 0);

  console.log('Syncing SEO cache...');
  await syncSeoCacheFromDatabase();

  const total = await Page.countDocuments();
  console.log('Total Page documents in MongoDB:', total);

  await mongoose.disconnect();
  console.log('Disconnected. Seed complete!');
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
