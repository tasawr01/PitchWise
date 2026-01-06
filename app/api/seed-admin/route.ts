import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    const name = "Tasawar Hussain";
    const email = "tasawar@email.com";
    const mobileNumber = "+923001234567";
    const passwordPlain = "123@#Qwe";

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const admin = await Admin.create({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
        });

        return NextResponse.json({ message: "Admin seeded successfully", adminId: admin._id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
