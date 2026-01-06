import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Dynamic ref based on logic or loose checking, usually we store refPath but keeping simple
    },
    userRole: {
        type: String,
        enum: ['entrepreneur', 'investor', 'admin'],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Action link
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
