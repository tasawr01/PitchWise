import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer: Buffer, folder: string = 'pitchwise', filename?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                use_filename: true, // Use the provided filename
                unique_filename: true, // Append random chars to avoid collisions
                filename_override: filename // Explicitly set filename for detection
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

export const deleteFromCloudinary = async (url: string): Promise<void> => {
    if (!url || !url.includes('cloudinary.com')) return;

    try {
        // Extract Public ID
        // Pattern: .../upload/v12345/folder/filename.ext or .../upload/folder/filename.ext
        const regex = /\/upload\/(?:v\d+\/)?(.*?)(?:\.[^/.]+)?$/;
        const match = url.match(regex);
        if (!match) return;

        const publicId = match[1];

        // Determine resource_type based on extension/url if possible or default to image
        // Cloudinary PDFs loaded as 'auto' -> 'image' often if used as doc, or 'raw'.
        // Videos are 'video'.
        // We'll try destroying as 'image' (default) then 'video' then 'raw' if needed, or just standard destroy.

        // Simple heuristic:
        let resourceType = 'image';
        if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
            resourceType = 'video';
        } else if (url.includes('.pdf') || url.includes('.doc')) {
            // PDFs are tricky with 'auto', can be image (paged) or raw.
            // If we used 'auto' upload without 'raw' enforced, it often becomes 'image' type for PDF page generation support.
            resourceType = 'image';
        }

        // Attempt deletion
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        // If it was a PDF and 'image' deletion failed (didn't exist), maybe it's 'raw'? 
        // Typically we accept silent failure if not found, but to be thorough:
        if (resourceType === 'image' && (url.endsWith('.pdf') || url.endsWith('.raw'))) {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }

    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};

export default cloudinary;
