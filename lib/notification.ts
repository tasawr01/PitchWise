import dbConnect from '@/lib/db';
import Notification, { INotification } from '@/models/Notification';
import Admin from '@/models/Admin';
import mongoose from 'mongoose';

/**
 * Create a notification for a specific user
 */
export async function createNotification(
    recipientId: string | mongoose.Types.ObjectId,
    recipientModel: 'Admin' | 'Entrepreneur' | 'Investor',
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    relatedId?: string | mongoose.Types.ObjectId,
    relatedModel?: string
) {
    try {
        await dbConnect();
        await Notification.create({
            recipient: recipientId,
            recipientModel,
            message,
            type,
            relatedId,
            relatedModel
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        // We catch error to ensure main flow is not interrupted
    }
}

/**
 * Notify all admins
 */
export async function notifyAdmins(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    relatedId?: string | mongoose.Types.ObjectId,
    relatedModel?: string
) {
    try {
        await dbConnect();
        const admins = await Admin.find({});

        if (admins.length === 0) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            recipientModel: 'Admin',
            message,
            type,
            relatedId,
            relatedModel
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
}
