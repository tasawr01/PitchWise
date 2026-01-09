import mongoose from 'mongoose';

const PitchUpdateSchema = new mongoose.Schema({
    pitch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pitch',
        required: true,
    },
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
        required: true,
    },
    // Mirroring Pitch Fields for the "New Version"
    // Step 1: Basics
    businessName: { type: String },
    title: { type: String },
    industry: { type: String },
    stage: {
        type: String,
        enum: ['Idea', 'MVP', 'Revenue', 'Growth'],
    },

    // Step 2: Problem & Solution
    problemStatement: { type: String },
    targetCustomer: { type: String },
    solution: { type: String },
    uniqueSellingPoint: { type: String },

    // Step 3: Product
    offeringType: {
        type: String,
        enum: ['Product', 'Service', 'Platform'],
    },
    productStatus: {
        type: String,
        enum: ['Concept', 'Prototype', 'Live'],
    },
    keyFeatures: {
        type: [String],
        validate: [(val: string[]) => val.length <= 5, '{PATH} exceeds the limit of 5'],
    },

    // Step 4: Market
    marketType: {
        type: String,
        enum: ['B2B', 'B2C', 'Both'],
    },
    hasExistingCustomers: { type: Boolean },
    customerCount: { type: Number, default: 0 },

    // Step 5: Revenue
    revenueModel: { type: String },
    pricingModel: { type: String },
    monthlyRevenue: { type: Number, default: 0 },

    // Step 6: Traction
    totalUsers: { type: Number, default: 0 },
    monthlyGrowthRate: { type: Number, default: 0 }, // Percentage
    majorMilestones: [String],

    // Step 7: Team
    founderName: { type: String },
    founderRole: { type: String },
    founderExpYears: { type: Number },
    teamSize: { type: Number },
    linkedinUrl: { type: String },

    // Step 8: Ask
    amountRequired: { type: Number },
    fundingType: {
        type: String,
        enum: ['Equity', 'Partnership', 'Other'],
    },
    equityOffered: { type: Number },
    useOfFunds: { type: String },

    // Step 9: Documents & Visuals
    pitchDeckUrl: { type: String },
    financialsUrl: { type: String },
    demoUrl: { type: String },

    // Request Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminComment: { type: String }
}, { timestamps: true });

export default mongoose.models.PitchUpdate || mongoose.model('PitchUpdate', PitchUpdateSchema);
