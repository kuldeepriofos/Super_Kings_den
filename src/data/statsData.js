// Comprehensive Chennai Super Kings Statistics & Leaderboards
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

// Team Records
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
