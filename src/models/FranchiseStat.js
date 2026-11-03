import mongoose from 'mongoose';

const FranchiseStatSchema = new mongoose.Schema(
  {
    franchise: {
      type: String,
      required: true,
      unique: true,
      enum: ['CSK', 'JSK', 'TSK'],
      index: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    league: {
      type: String,
      required: true,
    },
    overview: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    batting: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    bowling: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    records: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FranchiseStat || mongoose.model('FranchiseStat', FranchiseStatSchema);
