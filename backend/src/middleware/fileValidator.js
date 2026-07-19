const fileType = require('file-type');

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
  'text/csv' // CSV
];

const validateFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Check initial mimetype
  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` });
  }

  try {
    // For CSV, file-type might return undefined as it's just text
    if (req.file.mimetype === 'text/csv') {
      return next();
    }

    // Check magic numbers
    const type = await fileType.fromBuffer(req.file.buffer);
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
      return res.status(400).json({ error: 'File signature mismatch or unsupported file type.' });
    }
    
    // Safety check against executable extensions hiding in allowed types
    if (['exe', 'sh', 'bat', 'cmd'].includes(type.ext)) {
      return res.status(400).json({ error: 'Executables are strictly prohibited.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateFile, ALLOWED_MIME_TYPES };
