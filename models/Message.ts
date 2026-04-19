import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
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
            enum: ['Entrepreneur', 'Investor', 'Admin']
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
    },
    fileUrl: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sender.userModel'
    }]
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
