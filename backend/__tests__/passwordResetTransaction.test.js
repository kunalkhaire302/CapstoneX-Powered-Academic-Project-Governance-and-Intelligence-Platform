describe('password reset transaction', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  test('locks and consumes the reset token with the password update', async () => {
    const transaction = { LOCK: { UPDATE: 'UPDATE' } };
    const user = { id: 'user-1', update: jest.fn().mockResolvedValue(undefined) };
    const resetRecord = { user_id: user.id };
    const PasswordResetToken = {
      findOne: jest.fn().mockResolvedValue(resetRecord),
      update: jest.fn().mockResolvedValue([1]),
    };
    const User = { findByPk: jest.fn().mockResolvedValue(user) };
    const sequelize = { transaction: jest.fn(callback => callback(transaction)) };
    jest.doMock('../src/models', () => ({ sequelize, User, Institution: {}, PasswordResetToken }));
    jest.doMock('../src/utils/email', () => ({ sendEmail: jest.fn(), emailTemplates: {} }));
    jest.doMock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed-password'), compare: jest.fn() }));
    jest.doMock('../src/utils/auditLog', () => ({ createAuditLog: jest.fn().mockResolvedValue(undefined) }));
    jest.doMock('../src/config/firebase', () => ({ getFirebaseAuth: jest.fn(() => null) }));
    jest.doMock('../src/utils/logger', () => ({ error: jest.fn(), debug: jest.fn() }));
    const { resetPassword } = require('../src/controllers/authController');
    const res = { json: jest.fn() };
    const next = jest.fn();

    await resetPassword({ body: { token: 'a'.repeat(64), newPassword: 'ValidPassword1' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(PasswordResetToken.findOne).toHaveBeenCalledWith(expect.objectContaining({ transaction, lock: 'UPDATE' }));
    expect(user.update).toHaveBeenCalledWith(expect.objectContaining({ password_hash: expect.any(String) }), { transaction });
    expect(PasswordResetToken.update).toHaveBeenCalledWith({ used: true }, expect.objectContaining({ transaction }));
  });
});
