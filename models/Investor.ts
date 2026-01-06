import mongoose from 'mongoose';

const InvestorSchema = new mongoose.Schema({
    // Basic Info
    fullName: {
        type: String,
        required: [true, 'Please provide full name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
    },
    phoneCountry: String,
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
    },
    profilePhoto: String, // URL

    // Document Info
    documentType: {
        type: String,
        enum: ['cnic', 'passport'],
        required: true,
    },
    cnicNumber: String,
    cnicFront: String, // URL
    cnicBack: String, // URL
    passportNumber: String,
    issuingCountry: String,
    expiryDate: String,
    passportScan: String, // URL

    // Investor Specific
    investorType: String,
    investmentMin: String,
    investmentMax: String,
    industryPreferences: [String],
    cityCountry: String,
    organizationName: String,

    // Verification & Status
    isVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
