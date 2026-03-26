import PDFDocument from 'pdfkit';

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
