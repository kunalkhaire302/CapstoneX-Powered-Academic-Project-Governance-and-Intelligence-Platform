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
  },

  async down (queryInterface, Sequelize) {
    /**
     * Remove indexes on rollback
     */
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
