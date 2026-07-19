const { verifyToken } = require('../src/middleware/auth');
const jwt = require('jsonwebtoken');
const { User } = require('../src/models');
const { getFirebaseAuth } = require('../src/config/firebase');

jest.mock('jsonwebtoken');
jest.mock('../src/models');
jest.mock('../src/config/firebase');
jest.mock('../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('should return 401 if no auth header provided', async () => {
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
  });

  test('should return 401 if token is expired', async () => {
    req.headers.authorization = 'Bearer testtoken';
    getFirebaseAuth.mockReturnValue(null);
    jwt.verify.mockImplementation(() => {
      const err = new Error();
      err.name = 'TokenExpiredError';
      throw err;
    });

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired. Please refresh.' });
  });

  test('should call next if valid JWT token is provided', async () => {
    req.headers.authorization = 'Bearer validtoken';
    getFirebaseAuth.mockReturnValue(null);
    jwt.verify.mockReturnValue({ id: '123' });
    
    User.findByPk.mockResolvedValue({
      id: '123',
      email: 'test@test.com',
      role: 'student',
      name: 'Test',
      institution_id: 'inst1',
    });

    await verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('test@test.com');
  });
});
