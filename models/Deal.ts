import mongoose from 'mongoose';

const DealSchema = new mongoose.Schema({
    pitch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pitch',
        required: true,
    },
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investor',
        required: true,
    },
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    equity: {
        type: Number,
        required: true,
    },
    terms: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
    },
    documentUrl: {
        type: String, // Link to the generated/signed document
    },
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Deal) {
        delete mongoose.models.Deal;
    }
}

export default mongoose.models.Deal || mongoose.model('Deal', DealSchema);
