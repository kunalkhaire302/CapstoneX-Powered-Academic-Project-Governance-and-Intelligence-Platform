'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add indexes to frequently queried fields for performance optimization
     */
    
    // Users table
    await queryInterface.addIndex('users', ['email'], { name: 'users_email_idx' });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });

    // Groups table
    await queryInterface.addIndex('groups', ['join_code'], { name: 'groups_join_code_idx' });
    await queryInterface.addIndex('groups', ['mentor_id'], { name: 'groups_mentor_id_idx' });
    await queryInterface.addIndex('groups', ['coordinator_id'], { name: 'groups_coordinator_id_idx' });

    // Group Members table
    await queryInterface.addIndex('group_members', ['student_id'], { name: 'group_members_student_id_idx' });
    await queryInterface.addIndex('group_members', ['group_id'], { name: 'group_members_group_id_idx' });

    // Topics table
    await queryInterface.addIndex('topics', ['group_id'], { name: 'topics_group_id_idx' });

    // Logbooks table
    await queryInterface.addIndex('logbooks', ['group_id'], { name: 'logbooks_group_id_idx' });
    await queryInterface.addIndex('logbooks', ['student_id'], { name: 'logbooks_student_id_idx' });

    // Additional Foreign Key Indexes
    await queryInterface.addIndex('logbook_feedback', ['logbook_id'], { name: 'logbook_feedback_logbook_id_idx' });
    await queryInterface.addIndex('logbook_feedback', ['mentor_id'], { name: 'logbook_feedback_mentor_id_idx' });
    
    await queryInterface.addIndex('evaluations', ['group_id'], { name: 'evaluations_group_id_idx' });
    await queryInterface.addIndex('evaluations', ['mentor_id'], { name: 'evaluations_mentor_id_idx' });
    await queryInterface.addIndex('evaluations', ['student_id'], { name: 'evaluations_student_id_idx' });
    
    await queryInterface.addIndex('notifications', ['user_id'], { name: 'notifications_user_id_idx' });
    await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_id_idx' });
    
    await queryInterface.addIndex('ai_reports', ['group_id'], { name: 'ai_reports_group_id_idx' });
    await queryInterface.addIndex('ai_reports', ['student_id'], { name: 'ai_reports_student_id_idx' });
    
    await queryInterface.addIndex('risk_scores', ['group_id'], { name: 'risk_scores_group_id_idx' });
    
    await queryInterface.addIndex('meetings', ['group_id'], { name: 'meetings_group_id_idx' });
    await queryInterface.addIndex('meetings', ['mentor_id'], { name: 'meetings_mentor_id_idx' });
    
    await queryInterface.addIndex('problem_statements', ['group_id'], { name: 'problem_statements_group_id_idx' });
    await queryInterface.addIndex('problem_statements', ['student_id'], { name: 'problem_statements_student_id_idx' });
    
    await queryInterface.addIndex('recommendations', ['problem_statement_id'], { name: 'recommendations_problem_statement_id_idx' });
    await queryInterface.addIndex('recommendations', ['student_id'], { name: 'recommendations_student_id_idx' });
    
    await queryInterface.addIndex('recommendation_history', ['recommendation_id'], { name: 'recommendation_history_recommendation_id_idx' });
    await queryInterface.addIndex('recommendation_history', ['problem_statement_id'], { name: 'recommendation_history_problem_statement_id_idx' });
    await queryInterface.addIndex('recommendation_history', ['student_id'], { name: 'recommendation_history_student_id_idx' });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Remove indexes on rollback
     */
    await queryInterface.removeIndex('recommendation_history', 'recommendation_history_student_id_idx');
    await queryInterface.removeIndex('recommendation_history', 'recommendation_history_problem_statement_id_idx');
    await queryInterface.removeIndex('recommendation_history', 'recommendation_history_recommendation_id_idx');
    
    await queryInterface.removeIndex('recommendations', 'recommendations_student_id_idx');
    await queryInterface.removeIndex('recommendations', 'recommendations_problem_statement_id_idx');
    
    await queryInterface.removeIndex('problem_statements', 'problem_statements_student_id_idx');
    await queryInterface.removeIndex('problem_statements', 'problem_statements_group_id_idx');
    
    await queryInterface.removeIndex('meetings', 'meetings_mentor_id_idx');
    await queryInterface.removeIndex('meetings', 'meetings_group_id_idx');
    
    await queryInterface.removeIndex('risk_scores', 'risk_scores_group_id_idx');
    
    await queryInterface.removeIndex('ai_reports', 'ai_reports_student_id_idx');
    await queryInterface.removeIndex('ai_reports', 'ai_reports_group_id_idx');
    
    await queryInterface.removeIndex('audit_logs', 'audit_logs_user_id_idx');
    await queryInterface.removeIndex('notifications', 'notifications_user_id_idx');
    
    await queryInterface.removeIndex('evaluations', 'evaluations_student_id_idx');
    await queryInterface.removeIndex('evaluations', 'evaluations_mentor_id_idx');
    await queryInterface.removeIndex('evaluations', 'evaluations_group_id_idx');
    
    await queryInterface.removeIndex('logbook_feedback', 'logbook_feedback_mentor_id_idx');
    await queryInterface.removeIndex('logbook_feedback', 'logbook_feedback_logbook_id_idx');

    await queryInterface.removeIndex('logbooks', 'logbooks_student_id_idx');
    await queryInterface.removeIndex('logbooks', 'logbooks_group_id_idx');
    await queryInterface.removeIndex('topics', 'topics_group_id_idx');
    await queryInterface.removeIndex('group_members', 'group_members_group_id_idx');
    await queryInterface.removeIndex('group_members', 'group_members_student_id_idx');
    await queryInterface.removeIndex('groups', 'groups_coordinator_id_idx');
    await queryInterface.removeIndex('groups', 'groups_mentor_id_idx');
    await queryInterface.removeIndex('groups', 'groups_join_code_idx');
    await queryInterface.removeIndex('users', 'users_role_idx');
    await queryInterface.removeIndex('users', 'users_email_idx');
  }
};
