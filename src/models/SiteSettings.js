import mongoose from 'mongoose';
import defaultSettings from '../data/defaultSiteSettings.json';

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      index: true,
    },
    siteName: {
      type: String,
      default: defaultSettings.siteName,
    },
    siteTagline: {
      type: String,
      default: defaultSettings.siteTagline,
    },
    email: {
      type: String,
      default: defaultSettings.email || 'contact@superkingsden.com',
      trim: true,
    },
    primaryEmail: {
      type: String,
      default: defaultSettings.email || 'contact@superkingsden.com',
      trim: true,
    },
    phone: {
      type: String,
      default: defaultSettings.phone,
      trim: true,
    },
    whatsapp: {
      type: String,
      default: defaultSettings.whatsapp,
      trim: true,
    },
    address: {
      type: String,
      default: defaultSettings.address,
      trim: true,
    },
    deskHours: {
      type: String,
      default: defaultSettings.deskHours,
      trim: true,
    },
    social: {
      twitter: { type: String, default: defaultSettings.social.twitter, trim: true },
      facebook: { type: String, default: defaultSettings.social.facebook, trim: true },
      instagram: { type: String, default: defaultSettings.social.instagram, trim: true },
      youtube: { type: String, default: defaultSettings.social.youtube, trim: true },
      whatsapp: { type: String, default: defaultSettings.social.whatsapp, trim: true },
      telegram: { type: String, default: defaultSettings.social.telegram, trim: true },
      threads: { type: String, default: defaultSettings.social.threads, trim: true },
      linkedin: { type: String, default: defaultSettings.social.linkedin, trim: true },
    },
    footer: {
      aboutText: { type: String, default: defaultSettings.footer.aboutText, trim: true },
      copyrightText: { type: String, default: defaultSettings.footer.copyrightText, trim: true },
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.SiteSettings;
}

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
