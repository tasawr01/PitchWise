
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PitchUpdate from '@/models/PitchUpdate';

export async function GET() {
    await dbConnect();
    const updates = await PitchUpdate.find({}).sort({ updatedAt: -1 });
    return NextResponse.json({ updates });
}
