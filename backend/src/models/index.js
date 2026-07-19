const { sequelize, Sequelize } = require('../config/database');
const { DataTypes } = Sequelize;

// ──────────────────────────────────────────
// Model Definitions
// ──────────────────────────────────────────

const Institution = sequelize.define('institutions', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  domain: { type: DataTypes.STRING(255), unique: true },
  settings_json: { type: DataTypes.JSONB, defaultValue: {} },
});

const User = sequelize.define('users', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255) },
  role: {
    type: DataTypes.ENUM('student', 'mentor', 'hod', 'admin', 'accreditation'),
    allowNull: false,
    defaultValue: 'student',
  },
  institution_id: { type: DataTypes.UUID, references: { model: 'institutions', key: 'id' } },
  avatar_url: { type: DataTypes.STRING(500) },
  firebase_uid: { type: DataTypes.STRING(255), unique: true },
  department: { type: DataTypes.STRING(255) },
  skills: { type: DataTypes.JSONB, defaultValue: [] },
  interests: { type: DataTypes.JSONB, defaultValue: [] },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login_at: { type: DataTypes.DATE },
});

const Group = sequelize.define('groups', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  join_code: { type: DataTypes.STRING(10), unique: true },
  topic_id: { type: DataTypes.UUID },
  mentor_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  department: { type: DataTypes.STRING(255) },
  batch_year: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'forming',
  },
  max_members: { type: DataTypes.INTEGER, defaultValue: 4 },
});

const GroupMember = sequelize.define('group_members', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  student_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  role_in_group: {
    type: DataTypes.ENUM('leader', 'member'),
    defaultValue: 'member',
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  }
});

const Topic = sequelize.define('topics', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  title: { type: DataTypes.STRING(500), allowNull: false },
  abstract: { type: DataTypes.TEXT },
  domain_tags: { type: DataTypes.JSONB, defaultValue: [] },
  technology_tags: { type: DataTypes.JSONB, defaultValue: [] },
  file_url: { type: DataTypes.STRING(500) },
  ai_scores: { type: DataTypes.JSONB, defaultValue: {} },
  ai_suggestions: { type: DataTypes.JSONB, defaultValue: {} },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  rejection_reason: { type: DataTypes.TEXT },
  submitted_at: { type: DataTypes.DATE },
  approved_at: { type: DataTypes.DATE },
  approved_by: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
});

const Logbook = sequelize.define('logbooks', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  student_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  week_number: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(500) },
  content: { type: DataTypes.TEXT, allowNull: false },
  file_url: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'on_time',
  },
  submitted_at: { type: DataTypes.DATE },
});

const LogbookFeedback = sequelize.define('logbook_feedback', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  logbook_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'logbooks', key: 'id' } },
  mentor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  comment: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('approved', 'rejected', 'revision_requested'),
    allowNull: false,
  },
});

const Evaluation = sequelize.define('evaluations', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  mentor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  student_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  type: {
    type: DataTypes.ENUM('mid_term', 'final', 'viva', 'presentation', 'report'),
    allowNull: false,
  },
  rubric_json: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  total_score: { type: DataTypes.FLOAT },
  max_score: { type: DataTypes.FLOAT, defaultValue: 100 },
  ai_feedback: { type: DataTypes.TEXT },
  submitted_at: { type: DataTypes.DATE },
});

const Notification = sequelize.define('notifications', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  type: {
    type: DataTypes.ENUM('submission', 'feedback', 'approval', 'alert', 'system'),
    allowNull: false,
  },
  title: { type: DataTypes.STRING(500), allowNull: false },
  body: { type: DataTypes.TEXT },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING(500) },
  metadata_json: { type: DataTypes.JSONB, defaultValue: {} },
});

const AuditLog = sequelize.define('audit_logs', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entity_type: { type: DataTypes.STRING(100) },
  entity_id: { type: DataTypes.UUID },
  metadata_json: { type: DataTypes.JSONB, defaultValue: {} },
  ip_address: { type: DataTypes.STRING(45) },
});

const AiReport = sequelize.define('ai_reports', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, references: { model: 'groups', key: 'id' } },
  student_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  model_name: { type: DataTypes.STRING(100), allowNull: false },
  model_version: { type: DataTypes.STRING(50) },
  report_type: {
    type: DataTypes.ENUM('recommendation', 'risk_prediction', 'feedback', 'team_formation'),
    allowNull: false,
  },
  result_json: { type: DataTypes.JSONB, allowNull: false },
  confidence: { type: DataTypes.FLOAT },
});

const RiskScore = sequelize.define('risk_scores', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  score: { type: DataTypes.FLOAT, allowNull: false },
  label: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
  },
  features_json: { type: DataTypes.JSONB, defaultValue: {} },
  predicted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const Meeting = sequelize.define('meetings', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'groups', key: 'id' } },
  mentor_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  scheduled_at: { type: DataTypes.DATE, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  meeting_link: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
});

const PasswordResetToken = sequelize.define('password_reset_tokens', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  token_hash: { type: DataTypes.STRING(255), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ──────────────────────────────────────────
// Problem Statement Recommendation Models
// ──────────────────────────────────────────

const ProblemStatement = sequelize.define('problem_statements', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, references: { model: 'groups', key: 'id' } },
  student_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  title: { type: DataTypes.STRING(500), allowNull: false },
  problem_statement: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  domain: { type: DataTypes.STRING(255) },
  department: { type: DataTypes.STRING(255) },
  skills: { type: DataTypes.JSONB, defaultValue: [] },
  tech_stack: { type: DataTypes.JSONB, defaultValue: [] },
  team_members: { type: DataTypes.JSONB, defaultValue: [] },
  hackathon_theme: { type: DataTypes.STRING(255) },
  expected_users: { type: DataTypes.STRING(500) },
  target_audience: { type: DataTypes.STRING(500) },
  expected_impact: { type: DataTypes.TEXT },
  duration: { type: DataTypes.STRING(100) },
  status: {
    type: DataTypes.ENUM('draft', 'analyzed', 'improved', 'submitted'),
    defaultValue: 'draft',
  },
  embedding_vector_id: { type: DataTypes.STRING(100) },
});

const Recommendation = sequelize.define('recommendations', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  problem_statement_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'problem_statements', key: 'id' } },
  student_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  scores_json: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  similar_projects_json: { type: DataTypes.JSONB, defaultValue: [] },
  ai_suggestions_json: { type: DataTypes.JSONB, defaultValue: {} },
  sdg_alignment: { type: DataTypes.JSONB, defaultValue: [] },
  keywords: { type: DataTypes.JSONB, defaultValue: [] },
  domain_analysis_json: { type: DataTypes.JSONB, defaultValue: {} },
  warnings_json: { type: DataTypes.JSONB, defaultValue: [] },
  version: { type: DataTypes.INTEGER, defaultValue: 1 },
  model_version: { type: DataTypes.STRING(50), defaultValue: '2.0-hybrid-embedding' },
});

const PreviousProject = sequelize.define('previous_projects', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(500), allowNull: false },
  description: { type: DataTypes.TEXT },
  domain: { type: DataTypes.STRING(255) },
  tech_stack: { type: DataTypes.JSONB, defaultValue: [] },
  hackathon_name: { type: DataTypes.STRING(255) },
  year: { type: DataTypes.INTEGER },
  outcome: { type: DataTypes.STRING(100) },
  embedding_id: { type: DataTypes.STRING(100) },
});

const RecommendationHistory = sequelize.define('recommendation_history', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  recommendation_id: { type: DataTypes.UUID, references: { model: 'recommendations', key: 'id' } },
  problem_statement_id: { type: DataTypes.UUID, references: { model: 'problem_statements', key: 'id' } },
  student_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' } },
  action: {
    type: DataTypes.ENUM('analyzed', 'improved', 'rescored', 'submitted'),
    allowNull: false,
  },
  scores_snapshot: { type: DataTypes.JSONB, defaultValue: {} },
});

// ──────────────────────────────────────────
// Associations
// ──────────────────────────────────────────

// Institution ↔ Users
Institution.hasMany(User, { foreignKey: 'institution_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.belongsTo(Institution, { foreignKey: 'institution_id' });

// User ↔ PasswordResetToken
User.hasMany(PasswordResetToken, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

// Group ↔ Users (mentor, coordinator)
User.hasMany(Group, { foreignKey: 'mentor_id', as: 'mentored_groups', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.hasMany(Group, { foreignKey: 'coordinator_id', as: 'coordinated_groups', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'mentor_id', as: 'mentor' });
Group.belongsTo(User, { foreignKey: 'coordinator_id', as: 'coordinator' });

// Group ↔ GroupMembers ↔ Users (many-to-many through group_members)
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'members', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(GroupMember, { foreignKey: 'student_id', as: 'group_memberships', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
GroupMember.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Group ↔ Topic (one-to-many through group_id)
Group.hasMany(Topic, { foreignKey: 'group_id', as: 'topics', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Topic.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Topic, { foreignKey: 'approved_by', as: 'approved_topics', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Logbook associations
Group.hasMany(Logbook, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Logbook.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Logbook, { foreignKey: 'student_id', as: 'logbooks', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Logbook.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Logbook ↔ LogbookFeedback
Logbook.hasMany(LogbookFeedback, { foreignKey: 'logbook_id', as: 'feedback', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
LogbookFeedback.belongsTo(Logbook, { foreignKey: 'logbook_id' });
User.hasMany(LogbookFeedback, { foreignKey: 'mentor_id', as: 'given_feedback', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
LogbookFeedback.belongsTo(User, { foreignKey: 'mentor_id', as: 'mentor' });

// Evaluation associations
Group.hasMany(Evaluation, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluation.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Evaluation, { foreignKey: 'mentor_id', as: 'given_evaluations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluation.belongsTo(User, { foreignKey: 'mentor_id', as: 'evaluator' });
User.hasMany(Evaluation, { foreignKey: 'student_id', as: 'received_evaluations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluation.belongsTo(User, { foreignKey: 'student_id', as: 'evaluated_student' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// AuditLog associations
User.hasMany(AuditLog, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// AI Report associations
Group.hasMany(AiReport, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AiReport.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(AiReport, { foreignKey: 'student_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
AiReport.belongsTo(User, { foreignKey: 'student_id' });

// Risk Score associations
Group.hasMany(RiskScore, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RiskScore.belongsTo(Group, { foreignKey: 'group_id' });

// Meeting associations
Group.hasMany(Meeting, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Meeting.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(Meeting, { foreignKey: 'mentor_id', as: 'scheduled_meetings', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Meeting.belongsTo(User, { foreignKey: 'mentor_id', as: 'mentor_scheduler' });

// ProblemStatement associations
Group.hasMany(ProblemStatement, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProblemStatement.belongsTo(Group, { foreignKey: 'group_id' });
User.hasMany(ProblemStatement, { foreignKey: 'student_id', as: 'problem_statements', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProblemStatement.belongsTo(User, { foreignKey: 'student_id', as: 'submitter' });

// Recommendation associations
ProblemStatement.hasMany(Recommendation, { foreignKey: 'problem_statement_id', as: 'recommendations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Recommendation.belongsTo(ProblemStatement, { foreignKey: 'problem_statement_id' });
User.hasMany(Recommendation, { foreignKey: 'student_id', as: 'student_recommendations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Recommendation.belongsTo(User, { foreignKey: 'student_id' });

// RecommendationHistory associations
Recommendation.hasMany(RecommendationHistory, { foreignKey: 'recommendation_id', as: 'history', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RecommendationHistory.belongsTo(Recommendation, { foreignKey: 'recommendation_id' });
ProblemStatement.hasMany(RecommendationHistory, { foreignKey: 'problem_statement_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RecommendationHistory.belongsTo(ProblemStatement, { foreignKey: 'problem_statement_id' });
User.hasMany(RecommendationHistory, { foreignKey: 'student_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RecommendationHistory.belongsTo(User, { foreignKey: 'student_id' });

module.exports = {
  sequelize,
  Sequelize,
  Institution,
  User,
  Group,
  GroupMember,
  Topic,
  Logbook,
  LogbookFeedback,
  Evaluation,
  Notification,
  AuditLog,
  AiReport,
  RiskScore,
  Meeting,
  ProblemStatement,
  Recommendation,
  PreviousProject,
  RecommendationHistory,
  PasswordResetToken,
};
