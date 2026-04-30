export const DUMMY_CARD_NUMBER = '4242424242424242';

export function normalizeCardNumber(cardNumber: string) {
    return cardNumber.replace(/\D/g, '');
}

export function maskCardNumber(cardNumber: string) {
    const normalized = normalizeCardNumber(cardNumber);
    const last4 = normalized.slice(-4) || '0000';
    return `•••• •••• •••• ${last4}`;
}

export function buildDummyPaymentIntentId(dealId: string) {
    return `pi_dummy_${dealId}_${Date.now()}`;
}

export function buildDummyReceiptNumber() {
    return `PW-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function isFutureExpiry(expiry: string) {
    const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return false;

    const month = Number(match[1]);
    const year = Number(`20${match[2]}`);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function validateDummyPaymentInput(input: { cardNumber: string; expiry: string; cvc: string }) {
    const normalizedCardNumber = normalizeCardNumber(input.cardNumber);
    const normalizedExpiry = input.expiry.trim();
    const normalizedCvc = input.cvc.trim();

    if (normalizedCardNumber !== DUMMY_CARD_NUMBER) {
        return {
            valid: false,
            error: 'Invalid card number. Please verify your card details and try again.',
        };
    }

    if (!isFutureExpiry(normalizedExpiry)) {
        return {
            valid: false,
            error: 'Enter a valid future expiry date in MM/YY format.',
        };
    }

    if (!/^\d{3,4}$/.test(normalizedCvc)) {
        return {
            valid: false,
            error: 'Enter a valid 3 or 4 digit CVC.',
        };
    }

    return {
        valid: true,
        normalizedCardNumber,
        maskedCardNumber: maskCardNumber(normalizedCardNumber),
        cardLast4: normalizedCardNumber.slice(-4),
    };
}
