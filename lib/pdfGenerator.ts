import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export interface DealInfo {
    _id: string;
    startupName: string;
    entrepreneurName: string;
    investorName: string;
    amount: number;
    equity: number;
    terms: string;
    date: string;
}

export async function generateDealPDFBuffer(dealInfo: DealInfo): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('INVESTMENT AGREEMENT', { align: 'center' });
            doc.moveDown();

            doc.fontSize(10).font('Helvetica').fillColor('gray');
            doc.text(`Document ID: ${dealInfo._id}`, { align: 'center' });
            doc.text(`Date: ${dealInfo.date}`, { align: 'center' });
            doc.moveDown(2);

            // Parties Section
            doc.fontSize(16).fillColor('black').font('Helvetica-Bold').text('PARTIES');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(`The Investor: ${dealInfo.investorName}`);
            doc.text(`The Entrepreneur: ${dealInfo.entrepreneurName}`);
            doc.text(`The Startup (Business Name): ${dealInfo.startupName}`);
            doc.moveDown(1.5);

            // Investment Details
            doc.fontSize(16).font('Helvetica-Bold').text('INVESTMENT DETAILS');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(dealInfo.amount);
            doc.text(`Total Investment Amount: ${formattedAmount}`);
            doc.text(`Equity Stake: ${dealInfo.equity}%`);
            doc.moveDown(1.5);

            // Terms & Conditions
            doc.fontSize(16).font('Helvetica-Bold').text('TERMS & CONDITIONS');
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            doc.text(dealInfo.terms || 'Standard investment terms apply as agreed upon by both parties.', {
                align: 'justify',
                lineGap: 4
            });
            doc.moveDown(3);

            // Signatures
            const signatureY = doc.y;

            // Investor Signature line
            doc.moveTo(50, signatureY).lineTo(250, signatureY).stroke();
            doc.text(dealInfo.investorName, 50, signatureY + 10);
            doc.fontSize(10).fillColor('gray').text('Investor', 50, signatureY + 25);

            // Entrepreneur Signature line
            doc.moveTo(320, signatureY).lineTo(520, signatureY).stroke();
            doc.fontSize(12).fillColor('black').text(dealInfo.entrepreneurName, 320, signatureY + 10);
            doc.fontSize(10).fillColor('gray').text('Entrepreneur', 320, signatureY + 25);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

export interface PaymentReceiptInfo {
    paymentId: string;
    receiptNumber: string;
    dealId: string;
    startupName: string;
    investorName: string;
    entrepreneurName: string;
    amount: number;
    processedAt: string;
    cardLast4: string;
}

export async function generatePaymentReceiptBuffer(receiptInfo: PaymentReceiptInfo): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PKR',
                maximumFractionDigits: 0,
            }).format(receiptInfo.amount);

            const NAVY = '#0B2C4A';
            const TEXT = '#111827';
            const SUBTLE = '#6B7280';
            const BORDER = '#E5E7EB';
            const PANEL_BG = '#F9FAFB';
            const PILL_BG = '#DCFCE7';
            const PILL_TEXT = '#166534';

            const PAGE_WIDTH = 612;
            const MARGIN = 50;
            const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
            const RIGHT_X = PAGE_WIDTH - MARGIN;

            // ── HEADER ───────────────────────────────────────────────
            const logoPath = path.join(process.cwd(), 'public', 'assets', 'footerlogo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, MARGIN, MARGIN, { width: 110 });
            } else {
                doc.font('Helvetica-Bold').fontSize(20).fillColor(NAVY).text('PitchWise', MARGIN, MARGIN + 12);
            }

            doc.font('Helvetica-Bold').fontSize(28).fillColor(NAVY)
                .text('RECEIPT', MARGIN, MARGIN + 6, { align: 'right', width: CONTENT_WIDTH });
            doc.font('Helvetica').fontSize(10).fillColor(SUBTLE)
                .text(`Receipt No.  ${receiptInfo.receiptNumber}`, MARGIN, MARGIN + 42, { align: 'right', width: CONTENT_WIDTH })
                .text(`Issued      ${receiptInfo.processedAt}`, MARGIN, MARGIN + 56, { align: 'right', width: CONTENT_WIDTH });

            const headerDividerY = MARGIN + 90;
            doc.strokeColor(BORDER).lineWidth(1)
                .moveTo(MARGIN, headerDividerY).lineTo(RIGHT_X, headerDividerY).stroke();

            // ── PARTIES ──────────────────────────────────────────────
            const partiesY = headerDividerY + 28;
            const colW = CONTENT_WIDTH / 2 - 12;
            const rightColX = MARGIN + CONTENT_WIDTH / 2 + 12;

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE).text('BILLED TO', MARGIN, partiesY);
            doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT)
                .text(receiptInfo.investorName, MARGIN, partiesY + 16, { width: colW });
            doc.font('Helvetica').fontSize(10).fillColor(SUBTLE)
                .text('Investor', MARGIN, partiesY + 36, { width: colW });

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE).text('PAID TO', rightColX, partiesY);
            doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT)
                .text(receiptInfo.startupName, rightColX, partiesY + 16, { width: colW });
            doc.font('Helvetica').fontSize(10).fillColor(SUBTLE)
                .text(receiptInfo.entrepreneurName, rightColX, partiesY + 36, { width: colW });

            // ── ITEM TABLE ───────────────────────────────────────────
            const tableY = partiesY + 90;
            const headerH = 32;

            doc.rect(MARGIN, tableY, CONTENT_WIDTH, headerH).fill(NAVY);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
                .text('DESCRIPTION', MARGIN + 18, tableY + 12);
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
                .text('AMOUNT', MARGIN, tableY + 12, { align: 'right', width: CONTENT_WIDTH - 18 });

            const rowY = tableY + headerH;
            const rowH = 52;

            doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT)
                .text(`Investment in ${receiptInfo.startupName}`, MARGIN + 18, rowY + 14, { width: CONTENT_WIDTH * 0.6 });
            doc.font('Helvetica').fontSize(9).fillColor(SUBTLE)
                .text(`Deal Reference: ${receiptInfo.dealId}`, MARGIN + 18, rowY + 30, { width: CONTENT_WIDTH * 0.6 });
            doc.font('Helvetica').fontSize(11).fillColor(TEXT)
                .text(formattedAmount, MARGIN, rowY + 18, { align: 'right', width: CONTENT_WIDTH - 18 });

            doc.strokeColor(BORDER).lineWidth(1)
                .moveTo(MARGIN, rowY + rowH).lineTo(RIGHT_X, rowY + rowH).stroke();

            // ── TOTAL ────────────────────────────────────────────────
            const totalY = rowY + rowH + 24;
            doc.font('Helvetica').fontSize(10).fillColor(SUBTLE)
                .text('TOTAL PAID', MARGIN, totalY, { align: 'right', width: CONTENT_WIDTH - 18 });
            doc.font('Helvetica-Bold').fontSize(22).fillColor(NAVY)
                .text(formattedAmount, MARGIN, totalY + 14, { align: 'right', width: CONTENT_WIDTH - 18 });

            // ── PAYMENT DETAILS PANEL ────────────────────────────────
            const panelY = totalY + 70;
            const panelH = 110;

            doc.save();
            doc.roundedRect(MARGIN, panelY, CONTENT_WIDTH, panelH, 6).fillAndStroke(PANEL_BG, BORDER);
            doc.restore();

            const panelInnerX = MARGIN + 22;
            const panelRightX = MARGIN + CONTENT_WIDTH / 2 + 12;

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE)
                .text('PAYMENT METHOD', panelInnerX, panelY + 18);
            doc.font('Helvetica').fontSize(11).fillColor(TEXT)
                .text(`Visa ending in ${receiptInfo.cardLast4}`, panelInnerX, panelY + 34);

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE)
                .text('TRANSACTION ID', panelInnerX, panelY + 60);
            doc.font('Helvetica').fontSize(10).fillColor(TEXT)
                .text(receiptInfo.paymentId, panelInnerX, panelY + 76, { width: CONTENT_WIDTH / 2 - 30 });

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE)
                .text('STATUS', panelRightX, panelY + 18);
            const pillW = 60;
            const pillH = 18;
            doc.save();
            doc.roundedRect(panelRightX, panelY + 32, pillW, pillH, 9).fill(PILL_BG);
            doc.restore();
            doc.font('Helvetica-Bold').fontSize(9).fillColor(PILL_TEXT)
                .text('PAID', panelRightX, panelY + 37, { align: 'center', width: pillW });

            doc.font('Helvetica-Bold').fontSize(9).fillColor(SUBTLE)
                .text('GATEWAY', panelRightX, panelY + 60);
            doc.font('Helvetica').fontSize(10).fillColor(TEXT)
                .text('PitchWise Checkout', panelRightX, panelY + 76);

            // ── FOOTER ───────────────────────────────────────────────
            const footerY = 690;
            doc.strokeColor(BORDER).lineWidth(1)
                .moveTo(MARGIN, footerY).lineTo(RIGHT_X, footerY).stroke();

            doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY)
                .text('PitchWise', MARGIN, footerY + 12, { lineBreak: false });
            doc.font('Helvetica').fontSize(9).fillColor(SUBTLE)
                .text('Connecting student entrepreneurs with investors.',
                    MARGIN, footerY + 26, { lineBreak: false });

            doc.font('Helvetica').fontSize(9).fillColor(SUBTLE)
                .text('This receipt is computer-generated and does not require a signature.',
                    MARGIN, footerY + 19, { align: 'right', width: CONTENT_WIDTH, lineBreak: false });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}
