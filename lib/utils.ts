export function formatCurrency(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '') return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return String(value);

    // If value < 1,000 → return value as-is
    if (num < 1000) return num.toString();

    const suffixes = [
        { value: 1e12, symbol: 'T' },
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' }
    ];

    // Find the matching suffix
    const item = suffixes.find(item => num >= item.value);

    if (item) {
        // Divide by the value
        const divided = num / item.value;

        // Round to 1–2 decimal places
        // using toFixed(2) then parseFloat to remove trailing zeros
        // e.g. 1.50 -> 1.5, 1.00 -> 1
        const formatted = parseFloat(divided.toFixed(2)).toString();

        return formatted + item.symbol;
    }

    return num.toString();
}
