import mongoose from 'mongoose';

const FixtureSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    tournament: { type: String, default: 'IPL 2026' },
    matchdayTag: { type: String, default: 'MATCHDAY' },
    franchise: { type: String, default: 'CSK', index: true },
    year: { type: Number, default: 2026, index: true },
    season: { type: String, default: '2026', index: true },
    status: { type: String, default: 'Upcoming', index: true }, // 'Upcoming' | 'Completed' | 'Live'
    homeTeam: { type: String, default: 'Chennai Super Kings' },
    homeShort: { type: String, default: 'CSK' },
    homeLogo: { type: String, default: '' },
    homeRole: { type: String, default: 'HOSTS' },
    awayTeam: { type: String, default: 'Mumbai Indians' },
    awayShort: { type: String, default: 'MI' },
    awayLogo: { type: String, default: '' },
    awayRole: { type: String, default: 'CHALLENGERS' },
    vsLabel: { type: String, default: 'Chepauk' },
    date: { type: String, default: 'March 28, 2026' },
    time: { type: String, default: '7:30 PM IST' },
    countdownTarget: { type: String, default: '2026-03-28T19:30:00+05:30' },
    venue: { type: String, default: 'MA Chidambaram Stadium, Chepauk, Chennai' },
    pitchTitle: { type: String, default: 'Chepauk Pitch Insight:' },
    pitchInsight: {
      type: String,
      default:
        'Dry surface offering assistance to spinners in the middle overs. Average 1st innings score is 172. Win toss & bat first has 60% win rate.',
    },
    h2h: { type: String, default: 'CSK 17 - 20 MI (Last 5: CSK 4 - 1 MI)' },
    previewLink: { type: String, default: '/csk-news' },
    previewText: { type: String, default: 'View Match Preview & Playing 11' },

    // Completed Match & Scorecard fields (for "Last Match Score & Winner" mode)
    homeScore: { type: String, default: '' }, // e.g. "206/4"
    homeOvers: { type: String, default: '' }, // e.g. "20.0"
    awayScore: { type: String, default: '' }, // e.g. "186/6"
    awayOvers: { type: String, default: '' }, // e.g. "20.0"
    resultText: { type: String, default: '' }, // e.g. "CSK Won by 20 Runs"
    winner: { type: String, default: '' }, // e.g. "CSK" or "Chennai Super Kings"
    potm: { type: String, default: '' }, // Player of the match: "Matheesha Pathirana"
    potmRole: { type: String, default: '' }, // e.g. "4/28 in 4 ov"
    matchNote: { type: String, default: '' }, // Highlight commentary
    isFeatured: { type: Boolean, default: false }, // Pin to Match Center
    displayMode: { type: String, default: 'auto' }, // 'auto' | 'result' | 'countdown'

    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    strict: false,
  }
);

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Fixture;
}

export default mongoose.models.Fixture || mongoose.model('Fixture', FixtureSchema);
