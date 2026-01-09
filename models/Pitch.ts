import mongoose from 'mongoose';

const PitchSchema = new mongoose.Schema({
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
        required: true,
    },
    // Step 1: Basics
    businessName: { type: String, required: true },
    title: { type: String, required: true },
    industry: { type: String, required: true },
    stage: {
        type: String,
        enum: ['Idea', 'MVP', 'Revenue', 'Growth'],
        required: true
    },

    // Step 2: Problem & Solution
    problemStatement: { type: String, required: true },
    targetCustomer: { type: String, required: true },
    solution: { type: String, required: true },
    uniqueSellingPoint: { type: String, required: true },

    // Step 3: Product
    offeringType: {
        type: String,
        enum: ['Product', 'Service', 'Platform'],
        required: true
    },
    productStatus: {
        type: String,
        enum: ['Concept', 'Prototype', 'Live'],
        required: true
    },
    keyFeatures: {
        type: [String],
        validate: [(val: string[]) => val.length <= 5, '{PATH} exceeds the limit of 5'],
        required: true
    },

    // Step 4: Market
    marketType: {
        type: String,
        enum: ['B2B', 'B2C', 'Both'],
        required: true
    },
    hasExistingCustomers: { type: Boolean, required: true },
    customerCount: { type: Number, default: 0 },

    // Step 5: Revenue
    revenueModel: { type: String, required: true },
    pricingModel: { type: String, required: true },
    monthlyRevenue: { type: Number, default: 0 },

    // Step 6: Traction
    totalUsers: { type: Number, default: 0 },
    monthlyGrowthRate: { type: Number, default: 0 }, // Percentage
    majorMilestones: [String],

    // Step 7: Team
    founderName: { type: String, required: true },
    founderRole: { type: String, required: true },
    founderExpYears: { type: Number, required: true },
    teamSize: { type: Number, required: true },
    websiteUrl: { type: String },

    // Step 8: Ask
    amountRequired: { type: Number, required: true },
    fundingType: {
        type: String,
        enum: ['Equity', 'Partnership', 'Other'],
        required: true
    },
    equityOffered: { type: Number }, // Required if fundingType is Equity
    useOfFunds: { type: String, required: true },

    // Step 9: Documents & Visuals
    pitchDeckUrl: { type: String, required: true }, // PDF
    financialsUrl: { type: String }, // PDF (Optional)
    demoUrl: { type: String }, // Image/Video (Optional)

    // System Fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    views: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);
