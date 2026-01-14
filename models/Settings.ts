import mongoose, { Document, Model } from 'mongoose';

export interface ISettings extends Document {
    platformName: string;
    supportEmail: string;
    tagline: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    minPasswordLength: number;
    sessionTimeout: number;
    requireSpecialChars: boolean;
    admin2FA: boolean;
    notifyNewUser: boolean;
    notifyNewPitch: boolean;
    monthlyReports: boolean;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    forbiddenKeywords: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ISettingsModel extends Model<ISettings> {
    getSettings(): Promise<ISettings>;
}

const SettingsSchema = new mongoose.Schema({
    // General
    platformName: { type: String, default: 'PitchWise' },
    supportEmail: { type: String, default: 'pitchwisehub@gmail.com' },
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

const Settings = (mongoose.models.Settings as ISettingsModel) || mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema);

export default Settings;
