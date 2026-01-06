import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    mobileNumber: {
        type: String,
        required: [true, 'Please provide a mobile number'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
