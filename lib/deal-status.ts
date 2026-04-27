export interface DealStateShape {
    status?: string | null;
    paymentStatus?: string | null;
}

const legacyPaidStatuses = ['approved', 'completed'];

export function isDealRejected(deal: DealStateShape) {
    return deal.status === 'rejected';
}

export function isDealPaid(deal: DealStateShape) {
    return deal.paymentStatus === 'paid' || legacyPaidStatuses.includes(deal.status || '');
}

export function isDealAwaitingPayment(deal: DealStateShape) {
    return !isDealRejected(deal) && !isDealPaid(deal);
}

export function getDealStage(deal: DealStateShape) {
    if (isDealRejected(deal)) return 'rejected';
    if (isDealPaid(deal)) return 'paid';
    if (deal.paymentStatus === 'processing') return 'processing_payment';
    if (deal.paymentStatus === 'failed') return 'payment_failed';
    return 'awaiting_payment';
}

export function getDealStageLabel(deal: DealStateShape) {
    const stage = getDealStage(deal);

    if (stage === 'paid') return 'Paid';
    if (stage === 'processing_payment') return 'Processing';
    if (stage === 'payment_failed') return 'Payment Failed';
    if (stage === 'rejected') return 'Rejected';
    return 'Awaiting Payment';
}

export function getPaidDealQuery(extra: Record<string, unknown> = {}) {
    return {
        ...extra,
        $or: [
            { paymentStatus: 'paid' },
            { status: { $in: legacyPaidStatuses } },
        ],
    };
}
