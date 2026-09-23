const { normalizeAgentSelection, AGENT_CATALOG } = require('../src/services/agentCatalog');

describe('agent team catalog', () => {
  test('defaults to all nine governed agents', () => {
    expect(normalizeAgentSelection()).toHaveLength(9);
    expect(normalizeAgentSelection().map(agent => agent.key)).toEqual(AGENT_CATALOG.map(agent => agent.key));
  });

  test('drops unknown agents and preserves catalog order', () => {
    expect(normalizeAgentSelection(['quality_auditor', 'unknown', 'head_agent']).map(agent => agent.key))
      .toEqual(['head_agent', 'quality_auditor']);
  });
});
