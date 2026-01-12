import mongoose from 'mongoose';

const PitchSchema = new mongoose.Schema({
    entrepreneur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepreneur',
        required: true,
    },
    // Part 1: The Idea & The Market
    logoUrl: { type: String },
    businessName: { type: String },
    title: { type: String }, // One-line pitch
    industry: { type: String },
    problemStatement: { type: String }, // What real problem
    targetCustomer: { type: String }, // Who faces this
    problemUrgency: { type: String }, // Why urgent/painful
    solution: { type: String }, // Product/Service
    solutionMechanism: { type: String }, // How it works
    uniqueSellingPoint: { type: String }, // Why better
    competitors: { type: String }, // Who are competitors
    currentAlternatives: { type: String }, // How solved today
    marketSizeLocation: { type: String }, // Size & Location
    marketGrowth: { type: String }, // Is growing/Why

    // Part 2: The Business & Execution
    stage: {
        type: String,
        enum: ['Good Idea', 'Research & Development', 'Product Development', 'Shipping/Live', 'Revenue', 'Expansion'],
    },
    revenueModel: { type: String }, // How make money
    pricingModel: { type: String },
    revenuePerCustomer: { type: String }, // Expected rev/customer
    traction: { type: String }, // Users, sales, feedback
    customerValidation: { type: String }, // Proof they pay
    keyTechnology: { type: String }, // Key tech/ops
    moat: { type: String }, // Hard to copy
    risks: { type: String }, // Challenges/Risks
    riskMitigation: { type: String }, // How reduce risks
    founderBackground: { type: String },
    teamFit: { type: String }, // Why you?

    // Part 3: The Deal & The Future
    amountRequired: { type: Number },
    equityOffered: { type: Number },
    valuation: { type: Number },
    useOfFunds: { type: String },
    monthlyExpenses: { type: String },
    breakEvenPoint: { type: String },
    profitabilityTimeline: { type: String },
    vision: { type: String }, // 5-year vision
    exitPlan: { type: String }, // Acquisition/IPO
    noInvestmentPlan: { type: String }, // If no investment

    // Part 4: Documents & Visuals
    pitchDeckUrl: { type: String }, // PDF
    demoUrl: { type: String }, // Link/File
    tractionProofUrls: { type: [String], default: [] }, // Array of URLs
    financialsUrls: { type: [String], default: [] }, // Array of URLs

    // System Fields
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'permanently_rejected'],
        default: 'pending',
    },
    rejectionCount: {
        type: Number,
        default: 0,
    },
    remarks: {
        type: String,
        default: '',
    },
    history: [{
        action: { type: String, required: true }, // 'rejected', 'approved', 'updated'
        remarks: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if we track who rejected
        date: { type: Date, default: Date.now }
    }],
    views: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError while ensuring schema updates apply in dev
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Pitch) {
        delete mongoose.models.Pitch;
    }
}

export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema);
