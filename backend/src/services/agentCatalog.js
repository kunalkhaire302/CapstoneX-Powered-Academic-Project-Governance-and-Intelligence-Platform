const AGENT_CATALOG = Object.freeze([
  { key: 'head_agent', name: 'Head Agent', objective: 'Plan, coordinate, reconcile specialist findings, and produce the final decision brief.', sequence: 1 },
  { key: 'project_analyst', name: 'Project Analyst', objective: 'Evaluate requirements, scope, feasibility, completeness, users, and measurable outcomes.', sequence: 2 },
  { key: 'technical_reviewer', name: 'Technical Reviewer', objective: 'Evaluate architecture, technology choices, implementation risks, security, and operability.', sequence: 3 },
  { key: 'research_agent', name: 'Research Agent', objective: 'Assess novelty using supplied evidence and identify claims that still require external verification.', sequence: 4 },
  { key: 'documentation_agent', name: 'Documentation Agent', objective: 'Assess documentation readiness and create a concise structure for missing project artifacts.', sequence: 5 },
  { key: 'progress_monitor', name: 'Progress Monitor', objective: 'Evaluate milestones, deadlines, dependencies, blockers, and measurable delivery signals.', sequence: 6 },
  { key: 'recommendation_agent', name: 'Recommendation Agent', objective: 'Prioritize practical next actions, technologies, resources, and risk-reduction measures.', sequence: 7 },
  { key: 'communication_agent', name: 'Communication Agent', objective: 'Create clear stakeholder updates, review questions, reminders, and approval-ready messaging.', sequence: 8 },
  { key: 'quality_auditor', name: 'Quality Auditor', objective: 'Validate evidence, consistency, confidence, rubric coverage, and whether revision is required.', sequence: 9 },
]);

const ALLOWED_AGENT_KEYS = new Set(AGENT_CATALOG.map(agent => agent.key));

function normalizeAgentSelection(selectedAgents) {
  const requested = Array.isArray(selectedAgents) && selectedAgents.length
    ? selectedAgents.filter(key => ALLOWED_AGENT_KEYS.has(key))
    : AGENT_CATALOG.map(agent => agent.key);
  return AGENT_CATALOG.filter(agent => requested.includes(agent.key));
}

module.exports = { AGENT_CATALOG, normalizeAgentSelection };
