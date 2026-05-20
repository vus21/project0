import { cloudinaryConfig } from '../config/cloudinary.js';

// Hàm tiện ích để upload bộ nhớ đệm (buffer) lên Cloudinary qua stream
export const uploadBufferToCloudinary = (buffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryConfig.uploader.upload_stream(
      {
        folder: folderName,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Truyền buffer vào stream để upload
    uploadStream.end(buffer);
  });
};
