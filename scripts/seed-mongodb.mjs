import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables if .env.local exists
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/superkingsden';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'superkings2026';

console.log(' Connecting to MongoDB:', MONGODB_URI);

// Define Schemas directly in the script for standalone execution
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
    modified: { type: String },
    readingTime: { type: String, default: '3 min read' },
    views: { type: mongoose.Schema.Types.Mixed, default: '1.2K' },
    featuredImage: { type: String, default: '' },
    remoteImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const PlayerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    tag: { type: String, default: '' },
    role: { type: String, default: 'Batter' },
    jersey: { type: mongoose.Schema.Types.Mixed, default: '' },
    category: { type: String, default: 'Indian Player' },
    franchise: { type: String, default: 'CSK' },
    country: { type: String, default: 'India' },
    born: { type: String, default: '' },
    iplDebut: { type: String, default: '' },
    battingStyle: { type: String, default: '' },
    bowlingStyle: { type: String, default: '' },
    matches: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    highestScore: { type: String, default: '0' },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 },
    specialty: { type: String, default: '' },
    era: { type: String, default: '' },
    isLegend: { type: Boolean, default: false, index: true },
    isCurrent: { type: Boolean, default: true, index: true },
    avatar: { type: String, default: '' },
    trophies: { type: [String], default: [] },
    honors: { type: [String], default: [] },
    bio: { type: String, default: '' },
    stats: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

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
  },
  { timestamps: true }
);

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'superadmin' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', PostSchema);
const Player = mongoose.model('Player', PlayerSchema);
const Category = mongoose.model('Category', CategorySchema);
const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected successfully to MongoDB!');

    // 1. Seed Admin User
    console.log('\n--- Seeding Admin User ---');
    const existingAdmin = await AdminUser.findOne({ username: ADMIN_USERNAME.toLowerCase() });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(` Admin user "${ADMIN_USERNAME}" updated successfully.`);
    } else {
      await AdminUser.create({
        username: ADMIN_USERNAME.toLowerCase(),
        email: 'admin@superkingsden.com',
        passwordHash,
        role: 'superadmin',
      });
      console.log(` Created initial Admin user: "${ADMIN_USERNAME}" / "${ADMIN_PASSWORD}"`);
    }

    // 2. Seed Categories
    console.log('\n--- Seeding Categories ---');
    const catPath = path.join(rootDir, 'src', 'data', 'categoriesData.json');
    if (fs.existsSync(catPath)) {
      const categoriesData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
      let catUpsertCount = 0;
      for (const cat of categoriesData) {
        await Category.findOneAndUpdate(
          { slug: cat.slug },
          {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            count: cat.count || 0,
            franchise: cat.franchise || 'CSK',
            link: cat.link || '',
            parent: cat.parent || 0,
          },
          { upsert: true, returnDocument: 'after' }
        );
        catUpsertCount++;
      }
      console.log(` Upserted ${catUpsertCount} categories into MongoDB.`);
    }

    // 3. Seed Players from mockData.js (SQUAD_PLAYERS)
    console.log('\n--- Seeding CSK Squad & Legends ---');
    const mockDataPath = path.join(rootDir, 'src', 'data', 'mockData.js');
    const mockContent = fs.readFileSync(mockDataPath, 'utf8');
    const match = mockContent.match(/export const SQUAD_PLAYERS = (\[[\s\S]*?\]);\s*\nexport/);
    if (match) {
      // Safely evaluate array
      const players = eval(match[1]);
      let playerCount = 0;
      for (const p of players) {
        await Player.findOneAndUpdate(
          { slug: p.slug },
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            fullName: p.fullName || p.name,
            tag: p.tag || '',
            role: p.role,
            jersey: p.jersey || 0,
            category: p.category || 'Indian Player',
            franchise: p.franchise || 'CSK',
            country: p.country || 'India',
            born: p.born || '',
            iplDebut: p.iplDebut || '',
            battingStyle: p.battingStyle || '',
            bowlingStyle: p.bowlingStyle || '',
            matches: p.matches || 0,
            innings: p.innings || 0,
            runs: p.runs || 0,
            highestScore: String(p.highestScore || '0'),
            average: typeof p.average === 'number' ? p.average : parseFloat(p.average) || 0,
            strikeRate: typeof p.strikeRate === 'number' ? p.strikeRate : parseFloat(p.strikeRate) || 0,
            fifties: p.fifties || 0,
            hundreds: p.hundreds || 0,
            fours: p.fours || 0,
            sixes: p.sixes || 0,
            wickets: p.wickets || 0,
            catches: p.catches || 0,
            stumpings: p.stumpings || 0,
            specialty: p.specialty || '',
            era: p.era || '',
            isLegend: Boolean(p.isLegend),
            isCurrent: Boolean(p.isCurrent),
            avatar: p.avatar || '',
            trophies: p.trophies || [],
            honors: p.honors || [],
            bio: p.bio || '',
            stats: p.stats || [],
          },
          { upsert: true, returnDocument: 'after' }
        );
        playerCount++;
      }
      const currentCount = await Player.countDocuments({ isCurrent: true });
      const legendCount = await Player.countDocuments({ isLegend: true });
      console.log(` Upserted ${playerCount} total players (Current Squad: ${currentCount}, Legends: ${legendCount}).`);
    }

    // 4. Seed Posts from postsData.json
    console.log('\n--- Seeding Posts (CMS) ---');
    const postsPath = path.join(rootDir, 'src', 'data', 'postsData.json');
    if (fs.existsSync(postsPath)) {
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      console.log(` Found ${postsData.length} posts in postsData.json. Populating in bulk...`);

      // Prepare bulk operations for high performance
      const bulkOps = postsData.map((post) => ({
        updateOne: {
          filter: { slug: post.slug },
          update: {
            $set: {
              id: post.id,
              slug: post.slug,
              title: post.title,
              content: post.content || '',
              excerpt: post.excerpt || '',
              category: post.category || 'CSK News',
              franchise: post.franchise || 'CSK',
              author: post.author || 'Super Kings Den Team',
              date: post.date || '',
              modified: post.modified || '',
              readingTime: post.readingTime || '3 min read',
              views: post.views || 0,
              featuredImage: post.featuredImage || '',
              remoteImage: post.remoteImage || '',
              canonicalUrl: post.canonicalUrl || '',
              isPublished: true,
            },
          },
          upsert: true,
        },
      }));

      // Execute in chunks of 200
      const chunkSize = 200;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        await Post.bulkWrite(chunk);
        console.log(` Processed ${Math.min(i + chunkSize, bulkOps.length)} / ${bulkOps.length} posts...`);
      }

      const totalPostsInDb = await Post.countDocuments();
      console.log(` Total posts in MongoDB: ${totalPostsInDb}`);
    }

    console.log('\n Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(' Seeding error:', err);
    process.exit(1);
  }
}

seed();
