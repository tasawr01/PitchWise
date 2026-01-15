import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsletter extends Document {
    email: string;
    subscribedAt: Date;
}

const NewsletterSchema: Schema<INewsletter> = new Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

const Newsletter: Model<INewsletter> = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);

export default Newsletter;
