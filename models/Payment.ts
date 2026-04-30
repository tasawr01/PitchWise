import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true,
        unique: true,
    },
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
    currency: {
        type: String,
        default: 'PKR',
    },
    gateway: {
        type: String,
        default: 'dummy',
    },
    status: {
        type: String,
        enum: ['paid'],
        default: 'paid',
    },
    intentId: {
        type: String,
        required: true,
        unique: true,
    },
    cardBrand: {
        type: String,
        default: 'Visa',
    },
    cardLast4: {
        type: String,
        required: true,
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true,
    },
    receiptUrl: {
        type: String,
    },
    processedAt: {
        type: Date,
        default: Date.now,
    },
    simulated: {
        type: Boolean,
        default: true,
    },
    emailMode: {
        type: String,
        default: 'dummy',
    },
}, { timestamps: true });

if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Payment) {
        delete mongoose.models.Payment;
    }
}

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
