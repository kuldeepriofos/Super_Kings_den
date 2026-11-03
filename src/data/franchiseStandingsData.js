// Points Table & Standings Data for IPL (CSK), SA20 (JSK), and MLC (TSK)

export const IPL_STANDINGS = [
  { pos: 1, team: 'Chennai Super Kings', shortName: 'CSK', played: 14, won: 10, lost: 4, nrr: '+0.652', pts: 20, isLeader: true, tournament: 'IPL 2026' },
  { pos: 2, team: 'Kolkata Knight Riders', shortName: 'KKR', played: 14, won: 9, lost: 5, nrr: '+0.450', pts: 18, isLeader: false, tournament: 'IPL 2026' },
  { pos: 3, team: 'Sunrisers Hyderabad', shortName: 'SRH', played: 14, won: 8, lost: 6, nrr: '+0.310', pts: 16, isLeader: false, tournament: 'IPL 2026' },
  { pos: 4, team: 'Rajasthan Royals', shortName: 'RR', played: 14, won: 8, lost: 6, nrr: '+0.180', pts: 16, isLeader: false, tournament: 'IPL 2026' },
  { pos: 5, team: 'Royal Challengers Bengaluru', shortName: 'RCB', played: 14, won: 7, lost: 7, nrr: '+0.120', pts: 14, isLeader: false, tournament: 'IPL 2026' },
  { pos: 6, team: 'Delhi Capitals', shortName: 'DC', played: 14, won: 7, lost: 7, nrr: '-0.050', pts: 14, isLeader: false, tournament: 'IPL 2026' },
  { pos: 7, team: 'Lucknow Super Giants', shortName: 'LSG', played: 14, won: 7, lost: 7, nrr: '-0.110', pts: 14, isLeader: false, tournament: 'IPL 2026' },
  { pos: 8, team: 'Gujarat Titans', shortName: 'GT', played: 14, won: 6, lost: 8, nrr: '-0.220', pts: 12, isLeader: false, tournament: 'IPL 2026' },
  { pos: 9, team: 'Punjab Kings', shortName: 'PBKS', played: 14, won: 5, lost: 9, nrr: '-0.380', pts: 10, isLeader: false, tournament: 'IPL 2026' },
  { pos: 10, team: 'Mumbai Indians', shortName: 'MI', played: 14, won: 4, lost: 10, nrr: '-0.450', pts: 8, isLeader: false, tournament: 'IPL 2026' },
];

export const SA20_STANDINGS = [
  { pos: 1, team: 'Joburg Super Kings', shortName: 'JSK', played: 10, won: 7, lost: 3, nrr: '+0.540', pts: 28, isLeader: true, tournament: 'SA20 2026' },
  { pos: 2, team: 'Sunrisers Eastern Cape', shortName: 'SEC', played: 10, won: 6, lost: 4, nrr: '+0.320', pts: 25, isLeader: false, tournament: 'SA20 2026' },
  { pos: 3, team: "Durban's Super Giants", shortName: 'DSG', played: 10, won: 6, lost: 4, nrr: '+0.210', pts: 24, isLeader: false, tournament: 'SA20 2026' },
  { pos: 4, team: 'Paarl Royals', shortName: 'PR', played: 10, won: 5, lost: 5, nrr: '+0.050', pts: 20, isLeader: false, tournament: 'SA20 2026' },
  { pos: 5, team: 'MI Cape Town', shortName: 'MICT', played: 10, won: 3, lost: 7, nrr: '-0.310', pts: 13, isLeader: false, tournament: 'SA20 2026' },
  { pos: 6, team: 'Pretoria Capitals', shortName: 'PC', played: 10, won: 3, lost: 7, nrr: '-0.420', pts: 12, isLeader: false, tournament: 'SA20 2026' },
];

export const MLC_STANDINGS = [
  { pos: 1, team: 'Texas Super Kings', shortName: 'TSK', played: 7, won: 5, lost: 2, nrr: '+0.610', pts: 10, isLeader: true, tournament: 'MLC 2026' },
  { pos: 2, team: 'Washington Freedom', shortName: 'WAF', played: 7, won: 5, lost: 2, nrr: '+0.480', pts: 10, isLeader: false, tournament: 'MLC 2026' },
  { pos: 3, team: 'San Francisco Unicorns', shortName: 'SFU', played: 7, won: 4, lost: 3, nrr: '+0.150', pts: 8, isLeader: false, tournament: 'MLC 2026' },
  { pos: 4, team: 'MI New York', shortName: 'MINY', played: 7, won: 3, lost: 4, nrr: '-0.020', pts: 6, isLeader: false, tournament: 'MLC 2026' },
  { pos: 5, team: 'Seattle Orcas', shortName: 'SEO', played: 7, won: 2, lost: 5, nrr: '-0.310', pts: 4, isLeader: false, tournament: 'MLC 2026' },
  { pos: 6, team: 'Los Angeles Knight Riders', shortName: 'LAKR', played: 7, won: 2, lost: 5, nrr: '-0.420', pts: 4, isLeader: false, tournament: 'MLC 2026' },
];

export function getFranchiseStandings(franchise = 'CSK') {
  if (franchise === 'JSK') return SA20_STANDINGS;
  if (franchise === 'TSK') return MLC_STANDINGS;
  return IPL_STANDINGS;
}
