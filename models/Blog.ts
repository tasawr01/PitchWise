import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    excerpt: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
        default: '/assets/sample-blog.jpg', // A fallback, assuming a generic placeholder if they don't provide one
    },
    author: {
        type: String,
        default: 'Admin',
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Blog) {
        delete mongoose.models.Blog;
    }
}

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
