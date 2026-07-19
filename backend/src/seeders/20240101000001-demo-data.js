const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('CapstoneX@2024', 12);
    const now = new Date();
    const institutionId = uuidv4();

    // Institution
    await queryInterface.bulkInsert('institutions', [{
      id: institutionId, name: 'NMIMS University', domain: 'nmims.edu',
      settings_json: JSON.stringify({}), created_at: now, updated_at: now,
    }]);

    // Users - 10 students, 3 mentors, 2 coordinators, 1 HOD, 1 admin
    const adminId = uuidv4(), hodId = uuidv4();
    const mentorIds = [uuidv4(), uuidv4(), uuidv4()];
    const studentIds = Array.from({ length: 10 }, () => uuidv4());

    const users = [
      { id: adminId, name: 'Admin User', email: 'admin@capstonex.com', role: 'admin', department: 'Administration' },
      { id: hodId, name: 'Dr. Rajesh Kumar', email: 'hod@capstonex.com', role: 'hod', department: 'Computer Science' },
      { id: mentorIds[0], name: 'Prof. Anita Sharma', email: 'mentor1@capstonex.com', role: 'mentor', department: 'Computer Science' },
      { id: mentorIds[1], name: 'Prof. Vikram Patel', email: 'mentor2@capstonex.com', role: 'mentor', department: 'Computer Science' },
      { id: mentorIds[2], name: 'Prof. Sneha Gupta', email: 'mentor3@capstonex.com', role: 'mentor', department: 'Information Technology' },

      ...studentIds.map((id, i) => ({
        id, name: `Student ${i + 1}`, email: `student${i + 1}@capstonex.com`, role: 'student',
        department: i < 6 ? 'Computer Science' : 'Information Technology',
      })),
    ].map(u => ({
      ...u, password_hash: hash, institution_id: institutionId,
      is_active: true, skills: JSON.stringify([]), interests: JSON.stringify([]),
      created_at: now, updated_at: now,
    }));

    await queryInterface.bulkInsert('users', users);

    // Groups
    const groupIds = [uuidv4(), uuidv4(), uuidv4()];
    await queryInterface.bulkInsert('groups', [
      { id: groupIds[0], name: 'Team Alpha', join_code: 'ALPHA1', mentor_id: mentorIds[0], department: 'Computer Science', batch_year: 2024, status: 'in_progress', max_members: 4, created_at: now, updated_at: now },
      { id: groupIds[1], name: 'Team Beta', join_code: 'BETA02', mentor_id: mentorIds[1], department: 'Computer Science', batch_year: 2024, status: 'not_started', max_members: 4, created_at: now, updated_at: now },
      { id: groupIds[2], name: 'Team Gamma', join_code: 'GAMMA3', mentor_id: mentorIds[2], department: 'Information Technology', batch_year: 2024, status: 'submitted', max_members: 3, created_at: now, updated_at: now },
    ]);

    // Group Members
    const members = [
      ...studentIds.slice(0, 4).map((sid, i) => ({ id: uuidv4(), group_id: groupIds[0], student_id: sid, role_in_group: i === 0 ? 'leader' : 'member', created_at: now, updated_at: now })),
      ...studentIds.slice(4, 7).map((sid, i) => ({ id: uuidv4(), group_id: groupIds[1], student_id: sid, role_in_group: i === 0 ? 'leader' : 'member', created_at: now, updated_at: now })),
      ...studentIds.slice(7, 10).map((sid, i) => ({ id: uuidv4(), group_id: groupIds[2], student_id: sid, role_in_group: i === 0 ? 'leader' : 'member', created_at: now, updated_at: now })),
    ];
    await queryInterface.bulkInsert('group_members', members);

    // Topics
    const topicIds = [uuidv4(), uuidv4()];
    await queryInterface.bulkInsert('topics', [
      { id: topicIds[0], group_id: groupIds[0], title: 'AI-Powered Student Performance Prediction System', abstract: 'A machine learning system that predicts student academic performance using historical data and provides early intervention recommendations.', domain_tags: JSON.stringify(['AI/ML', 'Education']), technology_tags: JSON.stringify(['Python', 'TensorFlow', 'React']), status: 'approved', submitted_at: now, approved_at: now, created_at: now, updated_at: now },
      { id: topicIds[1], group_id: groupIds[2], title: 'Blockchain-Based Certificate Verification Platform', abstract: 'A decentralized platform for issuing and verifying academic certificates using blockchain technology.', domain_tags: JSON.stringify(['Blockchain', 'Security']), technology_tags: JSON.stringify(['Solidity', 'Node.js', 'React']), status: 'submitted', submitted_at: now, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkUpdate('groups', { topic_id: topicIds[0] }, { id: groupIds[0] });
    await queryInterface.bulkUpdate('groups', { topic_id: topicIds[1] }, { id: groupIds[2] });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('group_members', null, {});
    await queryInterface.bulkDelete('topics', null, {});
    await queryInterface.bulkDelete('groups', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('institutions', null, {});
  },
};
