'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agent_runs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      group_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'groups', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      created_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      workflow: { type: Sequelize.STRING(100), allowNull: false, defaultValue: 'proposal_review' },
      workflow_version: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '1.0' },
      objective: { type: Sequelize.TEXT, allowNull: false },
      context_json: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      constraints_json: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      selected_agents: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'queued' },
      confidence: { type: Sequelize.FLOAT },
      final_report_json: { type: Sequelize.JSONB },
      quality_report_json: { type: Sequelize.JSONB },
      token_usage_json: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      estimated_cost: { type: Sequelize.DECIMAL(12, 6), allowNull: false, defaultValue: 0 },
      requires_human_approval: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      approved_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      approved_at: { type: Sequelize.DATE },
      started_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      canceled_at: { type: Sequelize.DATE },
      error_message: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('agent_tasks', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      run_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'agent_runs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      agent_key: { type: Sequelize.STRING(80), allowNull: false },
      agent_name: { type: Sequelize.STRING(120), allowNull: false },
      objective: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'queued' },
      sequence: { type: Sequelize.INTEGER, allowNull: false },
      attempt: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      max_attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
      confidence: { type: Sequelize.FLOAT },
      result_json: { type: Sequelize.JSONB },
      token_usage_json: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      latency_ms: { type: Sequelize.INTEGER },
      error_message: { type: Sequelize.TEXT },
      started_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('agent_approvals', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      run_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'agent_runs', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      reviewer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      decision: { type: Sequelize.STRING(40), allowNull: false },
      comment: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('agent_runs', ['group_id', 'created_at']);
    await queryInterface.addIndex('agent_runs', ['created_by', 'created_at']);
    await queryInterface.addIndex('agent_runs', ['status']);
    await queryInterface.addIndex('agent_tasks', ['run_id', 'sequence']);
    await queryInterface.addIndex('agent_tasks', ['run_id', 'agent_key'], { unique: true });
    await queryInterface.addIndex('agent_tasks', ['status']);
    await queryInterface.addIndex('agent_approvals', ['run_id', 'created_at']);

    // Group creators are trusted members. Older rows used the pending default even for leaders.
    await queryInterface.bulkUpdate('group_members', { status: 'accepted' }, { role_in_group: 'leader', status: 'pending' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agent_approvals');
    await queryInterface.dropTable('agent_tasks');
    await queryInterface.dropTable('agent_runs');
  },
};
