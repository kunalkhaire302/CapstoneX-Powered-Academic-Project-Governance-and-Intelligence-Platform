const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '12345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

/**
 * Uploads a file buffer to Cloudinary via stream.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - The Cloudinary folder to upload to.
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
const uploadToCloudinary = (fileBuffer, folder = 'capstonex') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured, mocking successful upload.');
      return resolve(`https://mock-cloudinary.com/${folder}/file-${Date.now()}.pdf`);
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
