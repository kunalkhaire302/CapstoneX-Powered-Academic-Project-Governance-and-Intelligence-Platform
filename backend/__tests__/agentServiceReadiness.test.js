describe('AI Team service readiness', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('rejects localhost AI URLs in production without making a request', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'production', AI_SERVICE_URL: 'http://localhost:8000', AI_INTERNAL_SECRET: 'test-secret' };
    jest.doMock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
    const axios = require('axios');
    const { getAIServiceReadiness, assertAIServiceReady } = require('../src/services/agentTeamService');

    await expect(getAIServiceReadiness()).resolves.toEqual(expect.objectContaining({ available: false }));
    await expect(assertAIServiceReady()).rejects.toMatchObject({ statusCode: 503, code: 'AI_SERVICE_UNAVAILABLE' });
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('reports a healthy deployed AI service', async () => {
    process.env = { ...originalEnv, NODE_ENV: 'production', AI_SERVICE_URL: 'https://ai.example.test', AI_INTERNAL_SECRET: 'test-secret' };
    jest.doMock('axios', () => ({ get: jest.fn().mockResolvedValue({ data: { status: 'healthy' } }), post: jest.fn() }));
    const { getAIServiceReadiness } = require('../src/services/agentTeamService');

    await expect(getAIServiceReadiness({ refresh: true })).resolves.toEqual({ available: true, reason: null });
  });
});
