import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check format simply (backend regex in model also validates)
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return NextResponse.json({ message: 'Email already subscribed' }, { status: 200 }); // Treat as success to user
        }

        await Newsletter.create({ email });

        return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });

    } catch (error: any) {
        // Handle duplicate key error if race condition
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Email already subscribed' }, { status: 200 });
        }
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
