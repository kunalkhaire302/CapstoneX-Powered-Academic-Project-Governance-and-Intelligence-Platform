const { isRetryableAgentError } = require('../src/services/agentTeamService');

describe('AI Team automatic retry classification', () => {
  test.each([
    [{ code: 'ECONNABORTED' }],
    [{ response: { status: 429 } }],
    [{ response: { status: 503 } }],
  ])('retries a temporary AI-service failure', error => {
    expect(isRetryableAgentError(error)).toBe(true);
  });

  test('does not retry a permanent request error', () => {
    expect(isRetryableAgentError({ response: { status: 400 } })).toBe(false);
  });
});
