import mongoose, { Schema } from 'mongoose';

const MONGODB_URI = 'mongodb+srv://PitchWise:PitchPassword123@pitchwise.e7ffemc.mongodb.net/pitchwise?retryWrites=true&w=majority&appName=PitchWise';

const NewsletterSchema = new Schema({
    email: { type: String, required: true, unique: true }
});
// Use a different model name to avoid compilation conflicts if any
const TestNewsletter = mongoose.models.TestNewsletter || mongoose.model('TestNewsletter', NewsletterSchema);

async function main() {
    console.log('Connecting to DB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const email = `db_test_inline_${Date.now()}@example.com`;
        console.log(`Creating subscriber: ${email}`);

        const sub = await TestNewsletter.create({ email });
        console.log('Created:', sub);
    } catch (e) {
        console.error('Creation failed:', e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
