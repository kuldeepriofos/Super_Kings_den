// Comprehensive Super Kings Global Franchises (CSK, JSK, TSK) Statistics & Leaderboards
import franchiseStatsJson from './franchiseStatsData.json';

// ============================================================================
// 1. CHENNAI SUPER KINGS (CSK) — IPL
// ============================================================================
export const CSK_OVERVIEW_STATS = {
  totalMatches: 239,
  wins: 138,
  losses: 98,
  noResult: 3,
  winRate: '58.4%',
  titles: 5,
  finalsPlayed: 10,
  playoffsQualified: '12/17',
  playoffPct: '70.6%',
  highestScore: '246/5 vs RR (2010)',
  lowestScore: '79 vs MI (2013)',
  chepaukWinRate: '71.2%'
};

// All 10 IPL Finals Played by CSK (5 Titles Won + 5 Runners-up)
export const CSK_IPL_FINALS = [
  {
    year: 2023,
    outcome: 'Won',
    titleNum: 'Title #5',
    opponent: 'Gujarat Titans',
    opponentShort: 'GT',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    cskScore: '171/5 (15 ov, DLS)',
    opponentScore: '214/4 (20 ov)',
    margin: 'Won by 5 wickets (DLS)',
    hero: 'Ravindra Jadeja (15* off 6 balls, 10 off last 2)',
    potm: 'Devon Conway (47 off 25 balls)'
  },
  {
    year: 2021,
    outcome: 'Won',
    titleNum: 'Title #4',
    opponent: 'Kolkata Knight Riders',
    opponentShort: 'KKR',
    venue: 'Dubai International Stadium, Dubai',
    cskScore: '192/3 (20 ov)',
    opponentScore: '165/9 (20 ov)',
    margin: 'Won by 27 runs',
    hero: 'Faf du Plessis (86 off 59 balls) & Shardul Thakur (3/38)',
    potm: 'Faf du Plessis'
  },
  {
    year: 2019,
    outcome: 'Lost',
    titleNum: 'Runners-up',
    opponent: 'Mumbai Indians',
    opponentShort: 'MI',
    venue: 'Rajiv Gandhi Stadium, Hyderabad',
    cskScore: '148/7 (20 ov)',
    opponentScore: '149/8 (20 ov)',
    margin: 'Lost by 1 run',
    hero: 'Shane Watson (80 off 59 with bleeding knee)',
    potm: 'Jasprit Bumrah (2/14)'
  },
  {
    year: 2018,
    outcome: 'Won',
    titleNum: 'Title #3',
    opponent: 'Sunrisers Hyderabad',
    opponentShort: 'SRH',
    venue: 'Wankhede Stadium, Mumbai',
    cskScore: '181/2 (18.3 ov)',
    opponentScore: '178/6 (20 ov)',
    margin: 'Won by 8 wickets',
    hero: 'Shane Watson (117* off 57 balls)',
    potm: 'Shane Watson'
  },
  {
    year: 2015,
    outcome: 'Lost',
    titleNum: 'Runners-up',
    opponent: 'Mumbai Indians',
    opponentShort: 'MI',
    venue: 'Eden Gardens, Kolkata',
    cskScore: '161/8 (20 ov)',
    opponentScore: '202/5 (20 ov)',
    margin: 'Lost by 41 runs',
    hero: 'Dwayne Smith (57 off 48)',
    potm: 'Rohit Sharma (50 off 26)'
  },
  {
    year: 2013,
    outcome: 'Lost',
    titleNum: 'Runners-up',
    opponent: 'Mumbai Indians',
    opponentShort: 'MI',
    venue: 'Eden Gardens, Kolkata',
    cskScore: '125/9 (20 ov)',
    opponentScore: '148/9 (20 ov)',
    margin: 'Lost by 23 runs',
    hero: 'MS Dhoni (63* off 45 balls)',
    potm: 'Kieron Pollard (60* off 32)'
  },
  {
    year: 2012,
    outcome: 'Lost',
    titleNum: 'Runners-up',
    opponent: 'Kolkata Knight Riders',
    opponentShort: 'KKR',
    venue: 'MA Chidambaram Stadium, Chepauk',
    cskScore: '190/3 (20 ov)',
    opponentScore: '192/5 (19.4 ov)',
    margin: 'Lost by 5 wickets',
    hero: 'Suresh Raina (73 off 38 balls)',
    potm: 'Manvinder Bisla (89 off 48)'
  },
  {
    year: 2011,
    outcome: 'Won',
    titleNum: 'Title #2',
    opponent: 'Royal Challengers Bangalore',
    opponentShort: 'RCB',
    venue: 'MA Chidambaram Stadium, Chepauk',
    cskScore: '205/5 (20 ov)',
    opponentScore: '147/8 (20 ov)',
    margin: 'Won by 58 runs',
    hero: 'Murali Vijay (95 off 52) & Michael Hussey (63 off 45)',
    potm: 'Murali Vijay'
  },
  {
    year: 2010,
    outcome: 'Won',
    titleNum: 'Title #1',
    opponent: 'Mumbai Indians',
    opponentShort: 'MI',
    venue: 'DY Patil Stadium, Navi Mumbai',
    cskScore: '168/5 (20 ov)',
    opponentScore: '146/9 (20 ov)',
    margin: 'Won by 22 runs',
    hero: 'Suresh Raina (57* off 35 & 1/21) & MS Dhoni captaincy',
    potm: 'Suresh Raina'
  },
  {
    year: 2008,
    outcome: 'Lost',
    titleNum: 'Runners-up',
    opponent: 'Rajasthan Royals',
    opponentShort: 'RR',
    venue: 'DY Patil Stadium, Navi Mumbai',
    cskScore: '163/5 (20 ov)',
    opponentScore: '164/7 (20 ov)',
    margin: 'Lost by 3 wickets (last ball)',
    hero: 'Suresh Raina (43 off 30) & Albie Morkel (2/25)',
    potm: 'Yusuf Pathan (56 off 39 & 3/22)'
  }
];

// All-Time Batting Leaderboards for CSK
export const BATTING_LEADERBOARD = [
  { rank: 1, player: 'Suresh Raina', matches: 200, innings: 171, runs: 5529, avg: '33.10', sr: '136.7', fifties: 38, hundreds: 2, high: '100*' },
  { rank: 2, player: 'MS Dhoni', matches: 264, innings: 226, runs: 5243, avg: '39.12', sr: '137.5', fifties: 24, hundreds: 0, high: '84*' },
  { rank: 3, player: 'Faf du Plessis', matches: 100, innings: 92, runs: 2932, avg: '34.90', sr: '131.4', fifties: 21, hundreds: 0, high: '96' },
  { rank: 4, player: 'Ravindra Jadeja', matches: 240, innings: 172, runs: 2959, avg: '27.40', sr: '129.8', fifties: 3, hundreds: 0, high: '62*' },
  { rank: 5, player: 'Ruturaj Gaikwad', matches: 66, innings: 65, runs: 2380, avg: '41.75', sr: '136.9', fifties: 18, hundreds: 2, high: '108*' },
  { rank: 6, player: 'Michael Hussey', matches: 64, innings: 59, runs: 2213, avg: '40.98', sr: '122.8', fifties: 17, hundreds: 1, high: '116*' },
  { rank: 7, player: 'Murali Vijay', matches: 86, innings: 86, runs: 2205, avg: '26.56', sr: '123.4', fifties: 9, hundreds: 2, high: '127' },
  { rank: 8, player: 'Ambati Rayudu', matches: 90, innings: 80, runs: 1932, avg: '29.27', sr: '129.6', fifties: 8, hundreds: 1, high: '100*' },
  { rank: 9, player: 'Shivam Dube', matches: 45, innings: 41, runs: 1395, avg: '37.70', sr: '159.2', fifties: 9, hundreds: 0, high: '95*' },
  { rank: 10, player: 'Shane Watson', matches: 43, innings: 43, runs: 1252, avg: '30.53', sr: '136.3', fifties: 7, hundreds: 2, high: '117*' }
];

// All-Time Bowling Leaderboards for CSK
export const BOWLING_LEADERBOARD = [
  { rank: 1, player: 'Dwayne Bravo', matches: 130, innings: 127, wickets: 154, avg: '22.82', econ: '8.38', best: '4/22', fourWkts: 2 },
  { rank: 2, player: 'Ravindra Jadeja', matches: 240, innings: 181, wickets: 138, avg: '29.74', econ: '7.58', best: '5/16', fourWkts: 4 },
  { rank: 3, player: 'Ravichandran Ashwin', matches: 121, innings: 119, wickets: 120, avg: '24.22', econ: '6.45', best: '3/16', fourWkts: 0 },
  { rank: 4, player: 'Albie Morkel', matches: 92, innings: 88, wickets: 91, avg: '26.87', econ: '8.10', best: '4/32', fourWkts: 1 },
  { rank: 5, player: 'Deepak Chahar', matches: 76, innings: 76, wickets: 77, avg: '28.23', econ: '7.88', best: '4/13', fourWkts: 2 },
  { rank: 6, player: 'Mohit Sharma', matches: 58, innings: 57, wickets: 69, avg: '24.28', econ: '8.21', best: '4/14', fourWkts: 1 },
  { rank: 7, player: 'Shardul Thakur', matches: 57, innings: 56, wickets: 60, avg: '28.91', econ: '8.98', best: '3/28', fourWkts: 0 },
  { rank: 8, player: 'Doug Bollinger', matches: 41, innings: 41, wickets: 55, avg: '19.72', econ: '7.21', best: '4/13', fourWkts: 1 },
  { rank: 9, player: 'Matheesha Pathirana', matches: 20, innings: 20, wickets: 34, avg: '18.23', econ: '7.95', best: '4/28', fourWkts: 1 },
  { rank: 10, player: 'Imran Tahir', matches: 27, innings: 27, wickets: 35, avg: '21.08', econ: '7.11', best: '4/12', fourWkts: 2 }
];

// Team Records for CSK
export const TEAM_RECORDS = [
  { title: 'Highest Team Total', value: '246/5', details: 'vs Rajasthan Royals at Chepauk (2010)' },
  { title: 'Second Highest Total', value: '240/5', details: 'vs Kings XI Punjab at Mohali (2008)' },
  { title: 'Highest Total in Finals', value: '205/5', details: 'vs Royal Challengers Bangalore at Chepauk (2011)' },
  { title: 'Lowest Total Defended', value: '116/9', details: 'vs Kings XI Punjab at Durban (2009)' },
  { title: 'Highest Successful Chase', value: '208/5', details: 'vs Royal Challengers Bangalore at Chepauk (2012)' },
  { title: 'Largest Victory (Runs)', value: '97 Runs', details: 'vs Kings XI Punjab at Chepauk (2015)' },
  { title: 'Largest Victory (Wickets)', value: '10 Wickets', details: 'vs Kings XI Punjab at Mohali (2013 & 2020)' },
  { title: 'Consecutive Finals', value: '4 Consecutive', details: '2010, 2011, 2012, 2013 (All-time IPL record)' }
];

// ============================================================================
// 2. JOBURG SUPER KINGS (JSK) — SA20
// ============================================================================
export const JSK_OVERVIEW_STATS = {
  totalMatches: 33,
  wins: 17,
  losses: 14,
  noResult: 2,
  winRate: '53.1%',
  titles: '3x Semis',
  finalsPlayed: '3x',
  playoffsQualified: '3/3',
  playoffPct: '100%',
  highestScore: '211/6 vs PC (2024)',
  lowestScore: '78 vs MICT (2024)',
  fortressWinRate: '64.3%'
};

export const JSK_BATTING_LEADERBOARD = [
  { rank: 1, player: 'Faf du Plessis', matches: 33, innings: 32, runs: 894, avg: '33.11', sr: '142.8', fifties: 7, hundreds: 1, high: '113*' },
  { rank: 2, player: 'Leus du Plooy', matches: 22, innings: 21, runs: 669, avg: '37.16', sr: '144.5', fifties: 5, hundreds: 0, high: '81*' },
  { rank: 3, player: 'Reeza Hendricks', matches: 23, innings: 22, runs: 520, avg: '27.36', sr: '119.8', fifties: 4, hundreds: 0, high: '96' },
  { rank: 4, player: 'Donovan Ferreira', matches: 29, innings: 24, runs: 432, avg: '24.00', sr: '153.2', fifties: 2, hundreds: 0, high: '82*' },
  { rank: 5, player: 'Wayne Madsen', matches: 12, innings: 11, runs: 275, avg: '30.55', sr: '138.8', fifties: 2, hundreds: 0, high: '66' },
  { rank: 6, player: 'Moeen Ali', matches: 13, innings: 12, runs: 236, avg: '21.45', sr: '128.9', fifties: 1, hundreds: 0, high: '42' },
  { rank: 7, player: 'Romario Shepherd', matches: 15, innings: 12, runs: 198, avg: '22.00', sr: '158.4', fifties: 1, hundreds: 0, high: '40' },
  { rank: 8, player: 'Sibonelo Makhanya', matches: 14, innings: 11, runs: 168, avg: '18.66', sr: '115.8', fifties: 0, hundreds: 0, high: '37' }
];

export const JSK_BOWLING_LEADERBOARD = [
  { rank: 1, player: 'Lizaad Williams', matches: 20, innings: 20, wickets: 29, avg: '18.55', econ: '8.84', best: '4/19', fourWkts: 2 },
  { rank: 2, player: 'Imran Tahir', matches: 21, innings: 21, wickets: 23, avg: '21.30', econ: '7.22', best: '3/17', fourWkts: 0 },
  { rank: 3, player: 'Gerald Coetzee', matches: 13, innings: 13, wickets: 23, avg: '16.52', econ: '8.42', best: '4/24', fourWkts: 1 },
  { rank: 4, player: 'Nandre Burger', matches: 18, innings: 18, wickets: 19, avg: '24.21', econ: '7.95', best: '3/26', fourWkts: 0 },
  { rank: 5, player: 'Romario Shepherd', matches: 15, innings: 15, wickets: 14, avg: '27.50', econ: '8.90', best: '2/24', fourWkts: 0 },
  { rank: 6, player: 'Aaron Phangiso', matches: 9, innings: 9, wickets: 10, avg: '20.40', econ: '6.80', best: '4/20', fourWkts: 1 },
  { rank: 7, player: 'Kyle Simmonds', matches: 7, innings: 7, wickets: 8, avg: '21.25', econ: '6.80', best: '3/23', fourWkts: 0 },
  { rank: 8, player: 'Tabraiz Shamsi', matches: 8, innings: 8, wickets: 7, avg: '31.42', econ: '7.85', best: '2/18', fourWkts: 0 }
];

export const JSK_TEAM_RECORDS = [
  { title: 'Highest Team Total', value: '211/6', details: 'vs Pretoria Capitals at Centurion (2024)' },
  { title: 'Second Highest Total', value: '202/4', details: 'vs Durban\'s Super Giants at Kingsmead (2024)' },
  { title: 'Highest Individual Score', value: '113*', details: 'Faf du Plessis vs Sunrisers Eastern Cape (2023)' },
  { title: 'Best Bowling Figures', value: '4/19', details: 'Lizaad Williams vs Paarl Royals (2024)' },
  { title: 'Largest Victory (Runs)', value: '76 Runs', details: 'vs Sunrisers Eastern Cape at Bullring (2023)' },
  { title: 'Lowest Total Defended', value: '145/9', details: 'vs Paarl Royals at Bullring (2024)' },
  { title: 'Consecutive Semi-Finals', value: '3 in a Row', details: '2023, 2024, 2025 (100% Playoff qualification rate)' },
  { title: 'Highest Powerplay Score', value: '71/0', details: 'vs MI Cape Town at Wanderers Stadium (2024)' }
];

// ============================================================================
// 3. TEXAS SUPER KINGS (TSK) — MLC
// ============================================================================
export const TSK_OVERVIEW_STATS = {
  totalMatches: 19,
  wins: 11,
  losses: 7,
  noResult: 1,
  winRate: '61.1%',
  titles: '2x Finalists',
  finalsPlayed: '2x',
  playoffsQualified: '2/2',
  playoffPct: '100%',
  highestScore: '215/5 vs SFU (2023)',
  lowestScore: '115 vs MINY (2023)',
  fortressWinRate: '66.7%'
};

export const TSK_BATTING_LEADERBOARD = [
  { rank: 1, player: 'Faf du Plessis', matches: 19, innings: 19, runs: 888, avg: '52.23', sr: '168.4', fifties: 6, hundreds: 2, high: '103*' },
  { rank: 2, player: 'Devon Conway', matches: 17, innings: 17, runs: 512, avg: '34.13', sr: '129.5', fifties: 3, hundreds: 0, high: '75' },
  { rank: 3, player: 'Dwayne Bravo', matches: 18, innings: 15, runs: 268, avg: '26.80', sr: '145.2', fifties: 1, hundreds: 0, high: '76*' },
  { rank: 4, player: 'Milind Kumar', matches: 15, innings: 13, runs: 220, avg: '24.44', sr: '124.2', fifties: 1, hundreds: 0, high: '54' },
  { rank: 5, player: 'Mitchell Santner', matches: 15, innings: 12, runs: 192, avg: '24.00', sr: '135.2', fifties: 0, hundreds: 0, high: '45' },
  { rank: 6, player: 'David Miller', matches: 7, innings: 6, runs: 178, avg: '35.60', sr: '142.4', fifties: 1, hundreds: 0, high: '61' },
  { rank: 7, player: 'Calvin Savage', matches: 14, innings: 10, runs: 145, avg: '20.71', sr: '133.0', fifties: 0, hundreds: 0, high: '38*' },
  { rank: 8, player: 'Marcus Stoinis', matches: 5, innings: 5, runs: 124, avg: '24.80', sr: '141.0', fifties: 1, hundreds: 0, high: '51' }
];

export const TSK_BOWLING_LEADERBOARD = [
  { rank: 1, player: 'Mohammad Mohsin', matches: 17, innings: 17, wickets: 22, avg: '18.18', econ: '7.42', best: '4/8', fourWkts: 1 },
  { rank: 2, player: 'Gerald Coetzee', matches: 10, innings: 10, wickets: 16, avg: '19.37', econ: '8.65', best: '4/31', fourWkts: 1 },
  { rank: 3, player: 'Dwayne Bravo', matches: 18, innings: 17, wickets: 15, avg: '26.40', econ: '8.85', best: '3/28', fourWkts: 0 },
  { rank: 4, player: 'Mitchell Santner', matches: 15, innings: 15, wickets: 14, avg: '24.85', econ: '7.10', best: '3/20', fourWkts: 0 },
  { rank: 5, player: 'Zia-ul-Haq', matches: 12, innings: 12, wickets: 13, avg: '25.38', econ: '8.40', best: '3/33', fourWkts: 0 },
  { rank: 6, player: 'Naveen-ul-Haq', matches: 7, innings: 7, wickets: 9, avg: '22.11', econ: '8.12', best: '3/22', fourWkts: 0 },
  { rank: 7, player: 'Calvin Savage', matches: 14, innings: 11, wickets: 8, avg: '28.50', econ: '8.95', best: '2/25', fourWkts: 0 },
  { rank: 8, player: 'Marcus Stoinis', matches: 5, innings: 5, wickets: 6, avg: '21.66', econ: '8.20', best: '2/18', fourWkts: 0 }
];

export const TSK_TEAM_RECORDS = [
  { title: 'Highest Team Total', value: '215/5', details: 'vs San Francisco Unicorns at Grand Prairie (2023)' },
  { title: 'Second Highest Total', value: '203/4', details: 'vs Washington Freedom at Morrisville (2024)' },
  { title: 'Highest Individual Score', value: '103*', details: 'Faf du Plessis vs Washington Freedom (2024)' },
  { title: 'Best Bowling Figures', value: '4/8', details: 'Mohammad Mohsin vs Los Angeles Knight Riders (2023)' },
  { title: 'Largest Victory (Runs)', value: '69 Runs', details: 'vs Los Angeles Knight Riders at Grand Prairie (2023)' },
  { title: 'Highest Successful Chase', value: '187/5', details: 'vs Seattle Orcas at Grand Prairie (2024)' },
  { title: 'Most 6s in an Innings', value: '16 Sixes', details: 'vs San Francisco Unicorns at Dallas (2023)' },
  { title: 'Consecutive Playoff Appearances', value: '2 in a Row', details: '2023 & 2024 (100% Playoff qualification rate in MLC)' }
];

// Unified helper function to fetch stats dataset by franchise
export function getFranchiseStats(franchise = 'CSK') {
  const norm = (franchise || 'CSK').toUpperCase();
  if (franchiseStatsJson && franchiseStatsJson[norm]) {
    return franchiseStatsJson[norm];
  }
  if (norm === 'JSK') {
    return {
      franchise: 'JSK',
      teamName: 'Joburg Super Kings',
      shortName: 'JSK',
      league: 'SA20',
      title: 'JSK All-Time Franchise Analytics',
      subtitle: 'Performance records, batting firepower and bowling milestones across SA20 at the Bullring',
      matchLabel: 'SA20 Matches',
      fortressLabel: 'The Bullring Fortress',
      fortressSub: 'Wanderers Win Dominance',
      battingTitle: 'All-Time Leading Run Scorers for Joburg Super Kings',
      battingSubtitle: 'Ranked by total runs scored in SA20 competition',
      bowlingTitle: 'All-Time Leading Wicket Takers for Joburg Super Kings',
      bowlingSubtitle: 'Ranked by total wickets taken for JSK in SA20 history',
      overview: {
        totalMatches: JSK_OVERVIEW_STATS.totalMatches,
        wins: JSK_OVERVIEW_STATS.wins,
        losses: JSK_OVERVIEW_STATS.losses,
        titles: JSK_OVERVIEW_STATS.titles,
        titleSub: 'SA20 Playoff Record',
        finalsPlayed: JSK_OVERVIEW_STATS.finalsPlayed,
        finalsSub: 'Consecutive Semi-Finals',
        winRate: JSK_OVERVIEW_STATS.winRate,
        winLossSub: '17 Wins / 14 Losses',
        playoffsQualified: JSK_OVERVIEW_STATS.playoffsQualified,
        playoffRateSub: '100% Playoff Streak',
        fortressWinRate: JSK_OVERVIEW_STATS.fortressWinRate
      },
      batting: JSK_BATTING_LEADERBOARD,
      bowling: JSK_BOWLING_LEADERBOARD,
      records: JSK_TEAM_RECORDS
    };
  }

  if (norm === 'TSK') {
    return {
      franchise: 'TSK',
      teamName: 'Texas Super Kings',
      shortName: 'TSK',
      league: 'MLC',
      title: 'TSK All-Time Franchise Analytics',
      subtitle: 'Championship milestones, leaderboards and fortress records at Grand Prairie Stadium, Dallas',
      matchLabel: 'MLC Matches',
      fortressLabel: 'Grand Prairie Fortress',
      fortressSub: 'Dallas Home Dominance',
      battingTitle: 'All-Time Leading Run Scorers for Texas Super Kings',
      battingSubtitle: 'Ranked by total runs scored in Major League Cricket competition',
      bowlingTitle: 'All-Time Leading Wicket Takers for Texas Super Kings',
      bowlingSubtitle: 'Ranked by total wickets taken for TSK in MLC history',
      overview: {
        totalMatches: TSK_OVERVIEW_STATS.totalMatches,
        wins: TSK_OVERVIEW_STATS.wins,
        losses: TSK_OVERVIEW_STATS.losses,
        titles: TSK_OVERVIEW_STATS.titles,
        titleSub: 'MLC Challenger Runs',
        finalsPlayed: TSK_OVERVIEW_STATS.finalsPlayed,
        finalsSub: 'Back-to-Back Playoff Finishes',
        winRate: TSK_OVERVIEW_STATS.winRate,
        winLossSub: '11 Wins / 7 Losses',
        playoffsQualified: TSK_OVERVIEW_STATS.playoffsQualified,
        playoffRateSub: '100% Playoff Streak',
        fortressWinRate: TSK_OVERVIEW_STATS.fortressWinRate
      },
      batting: TSK_BATTING_LEADERBOARD,
      bowling: TSK_BOWLING_LEADERBOARD,
      records: TSK_TEAM_RECORDS
    };
  }

  // Default: CSK
  return {
    franchise: 'CSK',
    teamName: 'Chennai Super Kings',
    shortName: 'CSK',
    league: 'IPL',
    title: 'CSK All-Time Franchise Analytics',
    subtitle: 'The numbers behind the most consistent dynasty in modern T20 cricket history',
    matchLabel: 'IPL Matches',
    fortressLabel: 'Chepauk Fortress',
    fortressSub: 'Home Win Dominance',
    battingTitle: 'All-Time Leading Run Scorers for Chennai Super Kings',
    battingSubtitle: 'Ranked by total runs scored wearing the yellow jersey in IPL competition',
    bowlingTitle: 'All-Time Leading Wicket Takers for Chennai Super Kings',
    bowlingSubtitle: 'Ranked by total wickets taken for CSK in IPL history',
    overview: {
      totalMatches: CSK_OVERVIEW_STATS.totalMatches,
      wins: CSK_OVERVIEW_STATS.wins,
      losses: CSK_OVERVIEW_STATS.losses,
      titles: `${CSK_OVERVIEW_STATS.titles}x`,
      titleSub: 'Joint Most in IPL',
      finalsPlayed: CSK_OVERVIEW_STATS.finalsPlayed,
      finalsSub: 'All-Time #1 Record',
      winRate: CSK_OVERVIEW_STATS.winRate,
      winLossSub: '138 Wins / 98 Losses',
      playoffsQualified: CSK_OVERVIEW_STATS.playoffsQualified,
      playoffRateSub: `${CSK_OVERVIEW_STATS.playoffPct} Qual. Rate`,
      fortressWinRate: CSK_OVERVIEW_STATS.chepaukWinRate
    },
    batting: BATTING_LEADERBOARD,
    bowling: BOWLING_LEADERBOARD,
    records: TEAM_RECORDS
  };
}
