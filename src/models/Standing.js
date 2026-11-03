import mongoose from 'mongoose';

const StandingSchema = new mongoose.Schema(
  {
    pos: {
      type: Number,
      required: true,
      index: true,
    },
    team: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      default: '',
    },
    played: {
      type: Number,
      default: 0,
    },
    won: {
      type: Number,
      default: 0,
    },
    lost: {
      type: Number,
      default: 0,
    },
    nrr: {
      type: String,
      default: '+0.000',
    },
    pts: {
      type: Number,
      default: 0,
    },
    isLeader: {
      type: Boolean,
      default: false,
    },
    tournament: {
      type: String,
      default: 'IPL 2026',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Standing || mongoose.model('Standing', StandingSchema);
