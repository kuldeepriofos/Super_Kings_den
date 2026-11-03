import fs from 'fs';
import path from 'path';

/**
 * Synchronizes SQUAD_PLAYERS in src/data/mockData.js with current MongoDB players
 * so that any create, update, or delete in admin is immediately reflected in all static/fallback files.
 */
export async function syncMockDataSquad(PlayerModel) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'mockData.js');
    if (!fs.existsSync(filePath)) return;

    const allPlayers = await PlayerModel.find().sort({ isCurrent: -1, matches: -1 }).lean();
    const cleanPlayers = allPlayers.map((p) => ({
      id: p.id || String(p._id),
      slug: p.slug,
      name: p.name,
      fullName: p.fullName || p.name,
      role: p.role || 'Batter',
      jersey: p.jersey || '',
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
      highestScore: p.highestScore || '0',
      average: p.average || 0,
      strikeRate: p.strikeRate || 0,
      fifties: p.fifties || 0,
      hundreds: p.hundreds || 0,
      fours: p.fours || 0,
      sixes: p.sixes || 0,
      wickets: p.wickets || 0,
      bestBowling: p.bestBowling || '',
      economy: p.economy || 0,
      bowlingAverage: p.bowlingAverage || 0,
      fourWickets: p.fourWickets || 0,
      catches: p.catches || 0,
      stumpings: p.stumpings || 0,
      specialty: p.specialty || '',
      era: p.era || '',
      isLegend: p.isLegend || false,
      isCurrent: p.isCurrent !== false,
      avatar: p.avatar || '',
      trophies: p.trophies || [],
      honors: p.honors || [],
      bio: p.bio || '',
      content: p.content || '',
      tag: p.tag || '',
      stats: p.stats || [],
    }));

    let content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf('export const SQUAD_PLAYERS = ');
    if (startIdx === -1) return;

    const before = content.slice(0, startIdx);

    let after = `
// Franchise Fixtures
export const FIXTURES = [
  {
    id: 1,
    tournament: "IPL 2026",
    homeTeam: "Chennai Super Kings",
    awayTeam: "Mumbai Indians",
    homeShort: "CSK",
    awayShort: "MI",
    date: "March 28, 2026",
    time: "7:30 PM IST",
    venue: "MA Chidambaram Stadium, Chepauk, Chennai",
    status: "Upcoming",
    franchise: "CSK",
    countdownTarget: "2026-03-28T19:30:00+05:30",
    h2h: "CSK 17 - 20 MI (Last 5: CSK 4 - 1 MI)"
  },
  {
    id: 2,
    tournament: "SA20 League",
    homeTeam: "Joburg Super Kings",
    awayTeam: "Sunrisers Eastern Cape",
    homeShort: "JSK",
    awayShort: "SEC",
    date: "April 12, 2026",
    time: "9:00 PM IST",
    venue: "Wanderers Stadium, Johannesburg",
    status: "Upcoming",
    franchise: "JSK",
    countdownTarget: "2026-04-12T21:00:00+02:00",
    h2h: "JSK 3 - 3 SEC"
  },
  {
    id: 3,
    tournament: "Major League Cricket",
    homeTeam: "Texas Super Kings",
    awayTeam: "MI New York",
    homeShort: "TSK",
    awayShort: "MINY",
    date: "May 04, 2026",
    time: "6:00 AM IST",
    venue: "Grand Prairie Stadium, Dallas, Texas",
    status: "Upcoming",
    franchise: "TSK",
    countdownTarget: "2026-05-04T06:00:00+05:30",
    h2h: "TSK 2 - 2 MINY"
  }
];

// Fan Poll Data
export const INITIAL_POLL = {
  question: "Who will be CSK's most impactful match-winner this season?",
  totalVotes: 8420,
  options: [
    { id: 'opt1', text: "MS Dhoni (The Finisher)", votes: 3890 },
    { id: 'opt2', text: "Ruturaj Gaikwad (Captain / Opener)", votes: 2430 },
    { id: 'opt3', text: "Ravindra Jadeja (All-Rounder)", votes: 1140 },
    { id: 'opt4', text: "Matheesha Pathirana (Death Bowler)", votes: 960 }
  ]
};

// Standings / Points Table
export const STANDINGS_DATA = [
  { pos: 1, team: "Chennai Super Kings", played: 14, won: 10, lost: 4, nrr: "+0.652", pts: 20 },
  { pos: 2, team: "Kolkata Knight Riders", played: 14, won: 9, lost: 5, nrr: "+0.450", pts: 18 },
  { pos: 3, team: "Sunrisers Hyderabad", played: 14, won: 8, lost: 6, nrr: "+0.310", pts: 16 },
  { pos: 4, team: "Rajasthan Royals", played: 14, won: 8, lost: 6, nrr: "+0.180", pts: 16 },
  { pos: 5, team: "Mumbai Indians", played: 14, won: 7, lost: 7, nrr: "-0.050", pts: 14 }
];
`;

    const fixIdx = content.indexOf('export const FIXTURES');
    if (fixIdx !== -1) {
      after = '\n' + content.slice(fixIdx);
    }

    const newContent = `${before}export const SQUAD_PLAYERS = ${JSON.stringify(cleanPlayers, null, 2)};\n${after}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
  } catch (err) {
    console.warn('Failed to sync SQUAD_PLAYERS in mockData.js:', err.message);
  }
}
