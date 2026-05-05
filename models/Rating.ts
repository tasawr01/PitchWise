import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
    kind: {
        type: String,
        enum: ['investor', 'pitch'],
        required: true,
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    feedback: {
        type: String,
        default: '',
        trim: true,
        maxlength: 2000,
    },

    raterRole: {
        type: String,
        enum: ['investor', 'entrepreneur'],
        required: true,
    },
    raterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    // For kind='investor'
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investor',
    },
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
    },
    closureType: {
        type: String,
        enum: ['completed', 'discarded'],
    },

    // For kind='pitch'
    pitch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pitch',
    },
}, { timestamps: true });

RatingSchema.index(
    { conversation: 1 },
    { unique: true, partialFilterExpression: { kind: 'investor' } }
);

RatingSchema.index(
    { pitch: 1, raterId: 1 },
    { unique: true, partialFilterExpression: { kind: 'pitch' } }
);

RatingSchema.index({ investor: 1, kind: 1 });
RatingSchema.index({ pitch: 1, kind: 1 });

if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Rating) {
        delete mongoose.models.Rating;
    }
}

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
