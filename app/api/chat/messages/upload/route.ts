import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/auth';

// Give the route up to 60s — needed for cold-start compile + Cloudinary upload time
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Size limit: 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(buffer, 'chat_files', file.name);

        return NextResponse.json({
            url: result.secure_url,
            fileName: file.name,
            fileType: file.type,
        });

    } catch (error: any) {
        console.error('File upload error:', error);

        // Give a helpful message for timeout errors instead of generic 500
        const isTimeout = error?.http_code === 499 || error?.message?.includes('Timeout');
        return NextResponse.json(
            { error: isTimeout ? 'Upload timed out — please try again with a smaller file.' : 'Upload failed' },
            { status: isTimeout ? 408 : 500 }
        );
    }
}
