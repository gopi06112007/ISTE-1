const { cloudinary } = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} fileBuffer - The file buffer from Multer
 * @param {string} folder - Cloudinary folder path (e.g., 'iste-gmrit/profiles')
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'iste-gmrit') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Return a placeholder URL during development
      console.warn('⚠️  Cloudinary not configured. Using placeholder URL.');
      return resolve({
        url: `https://placehold.co/400x400/1A56DB/FFFFFF?text=ISTE+Photo`,
        publicId: `placeholder-${Date.now()}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' }, // Max width 1200px, maintain aspect ratio
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Failed to upload image to Cloudinary.'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID.
 *
 * @param {string} publicId - The Cloudinary public ID
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || publicId.startsWith('placeholder')) {
    return; // Skip if not configured or placeholder
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Non-fatal — log but don't throw
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
