import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    recipientModel: 'Admin' | 'Entrepreneur' | 'Investor';
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    relatedId?: mongoose.Types.ObjectId;
    relatedModel?: string; // 'Pitch', 'DocumentUpdate', 'User'
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Entrepreneur', 'Investor']
    },
    type: {
        type: String,
        required: true,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
