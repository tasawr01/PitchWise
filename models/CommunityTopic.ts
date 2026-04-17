import mongoose from 'mongoose';

const CommunityTopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.models.CommunityTopic || mongoose.model('CommunityTopic', CommunityTopicSchema);
