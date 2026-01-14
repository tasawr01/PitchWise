import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const user = process.env.GMAIL_USER;
        const pass = process.env.GMAIL_PASS;

        // 1. Check Env Vars availability (do not expose values)
        const envStatus = {
            GMAIL_USER: user ? 'Set' : 'Missing',
            GMAIL_PASS: pass ? 'Set (Length: ' + (pass?.length || 0) + ')' : 'Missing',
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Missing',
            VERCEL_URL: process.env.VERCEL_URL || 'Missing',
        };

        if (!user || !pass) {
            return NextResponse.json({
                success: false,
                message: 'Environment variables missing',
                envStatus
            }, { status: 500 });
        }

        // 2. Create Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });

        // 3. Verify Connection (SMTP Handshake)
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) reject(error);
                else resolve(success);
            });
        });

        // 4. Send Test Email
        const info = await transporter.sendMail({
            from: `"PitchWise Debug" <${user}>`,
            to: user, // Send to self
            subject: 'PitchWise Vercel Email Test',
            text: 'If you received this, sending emails from Vercel is working!',
            html: '<h3>Success!</h3><p>Email sending from Vercel is working correctly.</p>',
        });

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
            envStatus,
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Email sending failed',
            error: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command,
            // Include env status even on error to debug
            envStatus: {
                GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Missing',
                GMAIL_PASS: process.env.GMAIL_PASS ? 'Set' : 'Missing',
            }
        }, { status: 500 });
    }
}
