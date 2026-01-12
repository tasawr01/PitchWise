import mongoose from 'mongoose';

const EntrepreneurSchema = new mongoose.Schema({
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

    // Entrepreneur Specific
    startupName: String,
    yourRole: String,
    startupCategory: String,
    cityOfOperation: String,
    howDidYouHear: String,
    ideaSafetyPolicy: Boolean,

    // Verification & Status
    isVerified: {
        type: Boolean,
        default: false,
    },
    hasSeenWelcome: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });
// Schema update trigger: v1
export default mongoose.models.Entrepreneur || mongoose.model('Entrepreneur', EntrepreneurSchema);
