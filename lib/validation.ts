export const validatePitch = (data: any, files: any) => {
    const errors: string[] = [];
    const requiredFields = [
        'businessName', 'title', 'industry', 'problemStatement',
        'targetCustomer', 'problemUrgency', 'solution', 'solutionMechanism',
        'uniqueSellingPoint', 'competitors', 'currentAlternatives',
        'marketSizeLocation', 'marketGrowth', 'revenueModel', 'pricingModel',
        'revenuePerCustomer', 'traction', 'customerValidation', 'keyTechnology',
        'moat', 'risks', 'riskMitigation', 'founderBackground', 'teamFit',
        'amountRequired', 'equityOffered', 'valuation', 'useOfFunds',
        'monthlyExpenses', 'breakEvenPoint', 'profitabilityTimeline',
        'vision', 'exitPlan', 'noInvestmentPlan'
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(field);
        }
    }

    if (!files.logoUrl) errors.push('Company Logo');
    if (!files.pitchDeckUrl) errors.push('Pitch Deck');

    return errors;
};
