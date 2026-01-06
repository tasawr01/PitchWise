import mongoose from 'mongoose';

const DocumentUpdateSchema = new mongoose.Schema({
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
        required: true
    },
    // The proposed changes
    documentType: {
        type: String,
        enum: ['cnic', 'passport'],
    },
    cnicNumber: String,
    cnicFront: String, // New URL
    cnicBack: String,  // New URL
    passportNumber: String,
    passportScan: String, // New URL
    issuingCountry: String,
    expiryDate: String,

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminComment: String
}, { timestamps: true });

export default mongoose.models.DocumentUpdate || mongoose.model('DocumentUpdate', DocumentUpdateSchema);
