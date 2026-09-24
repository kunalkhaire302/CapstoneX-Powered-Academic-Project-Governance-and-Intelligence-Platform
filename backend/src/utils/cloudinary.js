const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary via stream.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - The Cloudinary folder to upload to.
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
const uploadToCloudinary = (fileBuffer, folder = 'capstonex') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const error = new Error('File storage is not configured. Contact an administrator.');
      error.statusCode = 503;
      logger.error('Cloudinary upload rejected because storage credentials are incomplete.');
      return reject(error);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary, cloudinary };
