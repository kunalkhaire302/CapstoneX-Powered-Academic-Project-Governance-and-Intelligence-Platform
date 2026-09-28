describe('AI health gateway', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('reports the focused runtime when detailed health is unavailable', async () => {
    process.env = { ...originalEnv, AI_SERVICE_URL: 'https://ai.example.test', AI_INTERNAL_SECRET: 'test-secret' };
    const get = jest.fn()
      .mockRejectedValueOnce({ response: { status: 404 }, message: 'Not Found' })
      .mockResolvedValueOnce({ data: { status: 'healthy', service: 'capstonex-agent-runtime', mode: 'fallback' } });
    jest.doMock('axios', () => ({ get, post: jest.fn() }));
    jest.doMock('../src/models', () => ({ AiReport: {}, RiskScore: {}, Group: {} }));
    jest.doMock('../src/utils/logger', () => ({ error: jest.fn() }));
    const { checkDetailedHealth } = require('../src/controllers/aiController');
    const json = jest.fn();

    await checkDetailedHealth({}, { json, status: jest.fn().mockReturnThis() });

    expect(get).toHaveBeenCalledTimes(2);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'healthy', version: 'limited runtime' }));
  });
});
