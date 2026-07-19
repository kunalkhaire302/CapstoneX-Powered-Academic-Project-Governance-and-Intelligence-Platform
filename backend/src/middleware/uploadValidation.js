const multer = require('multer');

// Allowed MIME types and their corresponding magic numbers (hex signatures)
const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'application/pdf': ['25504446'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304'], // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['504B0304'], // XLSX
  'text/csv': [] // CSVs are plain text, no reliable magic number
};

// Check magic numbers to prevent malicious executable masquerading as a document
const checkMagicNumber = (buffer, mimetype) => {
  if (mimetype === 'text/csv') {
    // Basic check for text content (no null bytes)
    for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
      if (buffer[i] === 0) return false;
    }
    return true;
  }

  const hexString = buffer.toString('hex', 0, 4).toUpperCase();
  const allowedSignatures = ALLOWED_MIME_TYPES[mimetype];
  
  if (!allowedSignatures) return false;
  
  return allowedSignatures.some(sig => hexString.startsWith(sig));
};

const multerFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.hasOwnProperty(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOCX, XLSX, and CSV are allowed.'), false);
  }
  cb(null, true);
};

// Upload handler with multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: multerFilter,
});

// Middleware to wrap multer and perform magic number validation
const secureUpload = (fieldName) => {
  const uploadSingle = upload.single(fieldName);

  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message });
      }

      // If no file uploaded, just continue
      if (!req.file) {
        return next();
      }

      // Validate magic numbers using buffer
      const isValid = checkMagicNumber(req.file.buffer, req.file.mimetype);
      if (!isValid) {
        return res.status(400).json({ error: 'File signature validation failed. The file appears to be corrupted or tampered with.' });
      }

      next();
    });
  };
};

module.exports = { secureUpload };
