import { v2 as cloudinary } from 'cloudinary';

// Configure once — reused across all API routes
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a file buffer to Cloudinary
// Returns the URL and public_id
export async function uploadReceipt(buffer, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'expense-tracker/receipts', // organized in folders
        public_id: filename,
        resource_type: 'auto',              // handles images + PDFs
        transformation: [
          { width: 1200, crop: 'limit' },   // max width 1200px
          { quality: 'auto' },              // auto compress
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// Delete image from Cloudinary when expense is deleted
export async function deleteReceipt(publicId) {
  return cloudinary.uploader.destroy(publicId);
}