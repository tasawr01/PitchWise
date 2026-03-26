import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'participants.userModel'
        },
        userModel: {
            type: String,
            required: true,
            enum: ['Entrepreneur', 'Investor', 'Admin']
        }
    }],
    pitch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pitch',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    dealStatus: {
        type: String,
        enum: ['in_progress', 'completed', 'discarded'],
        default: 'in_progress'
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {} // Keyed by userId
    }
}, { timestamps: true });

// Ensure unique conversation per pair per pitch? 
// Optional: ConversationSchema.index({ pitch: 1, 'participants.user': 1 }, { unique: true });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
