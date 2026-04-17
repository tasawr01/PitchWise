import mongoose from 'mongoose';

const CommunityMessageSchema = new mongoose.Schema({
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityTopic',
        required: true
    },
    sender: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender.userModel'
        },
        userModel: {
            type: String,
            required: true,
            enum: ['Admin', 'Investor']
        }
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'system', 'file'],
        default: 'text'
    }
}, { timestamps: true });

export default mongoose.models.CommunityMessage || mongoose.model('CommunityMessage', CommunityMessageSchema);
