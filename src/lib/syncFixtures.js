import fs from 'fs';
import path from 'path';

/**
 * Synchronizes FIXTURES in src/data/mockData.js with current MongoDB fixtures
 * so that any create, update, or delete in admin Match Center is immediately reflected across all files.
 */
export async function syncMockDataFixtures(FixtureModel) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'mockData.js');
    if (!fs.existsSync(filePath)) return;

    const allFixtures = await FixtureModel.find({ isActive: true, isDeleted: { $ne: true } }).sort({ order: 1, createdAt: 1 }).lean();
    if (!allFixtures || allFixtures.length === 0) return;

    const cleanFixtures = allFixtures.map((f, idx) => ({
      id: f.id || idx + 1,
      tournament: f.tournament || 'IPL 2026',
      matchdayTag: f.matchdayTag || 'MATCHDAY',
      homeTeam: f.homeTeam || 'Chennai Super Kings',
      awayTeam: f.awayTeam || 'Mumbai Indians',
      homeShort: f.homeShort || 'CSK',
      awayShort: f.awayShort || 'MI',
      homeLogo: f.homeLogo || '',
      homeRole: f.homeRole || 'HOSTS',
      awayLogo: f.awayLogo || '',
      awayRole: f.awayRole || 'CHALLENGERS',
      vsLabel: f.vsLabel || 'Chepauk',
      date: f.date || 'March 28, 2026',
      time: f.time || '7:30 PM IST',
      venue: f.venue || 'MA Chidambaram Stadium, Chepauk, Chennai',
      status: f.status || 'Completed',
      franchise: f.franchise || 'CSK',
      countdownTarget: f.countdownTarget || '',
      homeScore: f.homeScore || '',
      homeOvers: f.homeOvers || '',
      awayScore: f.awayScore || '',
      awayOvers: f.awayOvers || '',
      resultText: f.resultText || '',
      winner: f.winner || '',
      potm: f.potm || '',
      potmRole: f.potmRole || '',
      displayMode: f.displayMode || (f.status === 'Upcoming' ? 'countdown' : 'result'),
      pitchTitle: f.pitchTitle || 'Chepauk Pitch Insight:',
      pitchInsight: f.pitchInsight || 'Dry surface offering assistance to spinners in the middle overs. Average 1st innings score is 172.',
      h2h: f.h2h || 'CSK 17 - 20 MI (Last 5: CSK 4 - 1 MI)',
      previewLink: f.previewLink || '/csk-news',
      previewText: f.previewText || 'View Match Preview & Playing 11',
      order: f.order || idx + 1,
    }));

    let content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf('export const FIXTURES = ');
    if (startIdx === -1) return;

    const before = content.slice(0, startIdx);
    const afterIdx = content.indexOf('export const INITIAL_POLL', startIdx);
    const after = afterIdx !== -1 ? '\n\n' + content.slice(afterIdx) : '';

    const newContent = `${before}export const FIXTURES = ${JSON.stringify(cleanFixtures, null, 2)};${after}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
  } catch (err) {
    console.warn('Failed to sync FIXTURES in mockData.js:', err.message);
  }
}
