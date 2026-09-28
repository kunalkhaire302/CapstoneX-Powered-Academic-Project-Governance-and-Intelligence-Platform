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

  test('uses the dedicated model runtime when configured', async () => {
    process.env = {
      ...originalEnv,
      AI_SERVICE_URL: 'https://agent.example.test',
      AI_MODEL_SERVICE_URL: 'https://models.example.test',
      AI_INTERNAL_SECRET: 'test-secret',
    };
    const get = jest.fn().mockResolvedValue({ data: { status: 'healthy', version: '2.0.0' } });
    jest.doMock('axios', () => ({ get, post: jest.fn() }));
    jest.doMock('../src/models', () => ({ AiReport: {}, RiskScore: {}, Group: {} }));
    jest.doMock('../src/utils/logger', () => ({ error: jest.fn() }));
    const { checkDetailedHealth } = require('../src/controllers/aiController');
    const json = jest.fn();

    await checkDetailedHealth({}, { json, status: jest.fn().mockReturnThis() });

    expect(get).toHaveBeenCalledWith(
      'https://models.example.test/api/ai/health/detailed',
      expect.any(Object),
    );
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 'healthy', version: '2.0.0' }));
  });
});
