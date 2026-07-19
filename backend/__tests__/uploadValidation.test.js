const { secureUpload } = require('../src/middleware/uploadValidation');

// Mock multer
jest.mock('multer', () => {
  const multer = () => {
    const uploadSingle = (req, res, cb) => {
      if (req.multerError) {
        return cb(new Error('Multer Error'));
      }
      cb(null);
    };
    return { single: () => uploadSingle };
  };
  multer.memoryStorage = jest.fn();
  multer.MulterError = Error;
  return multer;
});

describe('Upload Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { file: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('should call next if no file is uploaded', () => {
    const middleware = secureUpload('file');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should reject invalid magic numbers for pdf', () => {
    const middleware = secureUpload('file');
    req.file = {
      mimetype: 'application/pdf',
      buffer: Buffer.from([0x00, 0x01, 0x02, 0x03]) // Invalid PDF magic number
    };
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'File signature validation failed. The file appears to be corrupted or tampered with.' });
  });

  test('should accept valid magic numbers for pdf', () => {
    const middleware = secureUpload('file');
    req.file = {
      mimetype: 'application/pdf',
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]) // Valid PDF magic number %PDF
    };
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
