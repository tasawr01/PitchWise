import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    // General
    platformName: { type: String, default: 'PitchWise' },
    supportEmail: { type: String, default: 'support@pitchwise.com' },
    tagline: { type: String, default: 'Connect, Pitch, Grow' },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },

    // Security
    minPasswordLength: { type: Number, default: 8 },
    sessionTimeout: { type: Number, default: 60 },
    requireSpecialChars: { type: Boolean, default: true },
    admin2FA: { type: Boolean, default: false },

    // Notifications
    notifyNewUser: { type: Boolean, default: true },
    notifyNewPitch: { type: Boolean, default: true },
    monthlyReports: { type: Boolean, default: false },

    // SMTP (Stored simply for demo, usually requires encryption)
    smtpHost: { type: String, default: 'smtp.sendgrid.net' },
    smtpPort: { type: String, default: '587' },
    smtpUser: { type: String, default: 'apikey' },
    smtpPass: { type: String, default: '' }, // Don't return to client ideally

    // Moderation
    forbiddenKeywords: { type: String, default: 'scam, fraud, illegal' },
}, { timestamps: true });

// Singleton pattern helper
SettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;
