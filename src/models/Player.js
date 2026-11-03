import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    tag: { type: String, default: '' }, // e.g. "Thala", "Captain", "Vice-Captain"
    role: { type: String, default: 'Batter' },
    jersey: { type: mongoose.Schema.Types.Mixed, default: '' },
    category: { type: String, default: 'Indian Player' },
    franchise: { type: String, default: 'CSK', index: true },
    franchises: { type: [String], default: ['CSK'], index: true },
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
    bestBowling: { type: String, default: '' },
    economy: { type: Number, default: 0 },
    bowlingAverage: { type: Number, default: 0 },
    fourWickets: { type: Number, default: 0 },
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
    content: { type: String, default: '' },
    stats: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
    strict: false,
  }
);

PlayerSchema.index({ name: 'text', fullName: 'text', role: 'text' });

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Player;
}

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
