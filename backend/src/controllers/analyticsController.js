const { sequelize, User, Group, GroupMember, Topic, Logbook, Evaluation, Notification } = {};
const { Op } = require('sequelize');

const getSystemAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalGroups, totalTopics, totalLogbooks, totalEvaluations] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Group.count(),
      Topic.count(),
      Logbook.count(),
      Evaluation.count(),
    ]);

    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { is_active: true }, group: ['role'], raw: true,
    });

    const groupsByStatus = await Group.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'], raw: true,
    });

    const topicsByStatus = await Topic.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'], raw: true,
    });

    // Submission rate last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await Logbook.count({
      where: { submitted_at: { [Op.gte]: sevenDaysAgo } },
    });

    // Evaluations completed this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyEvaluations = await Evaluation.count({
      where: { submitted_at: { [Op.gte]: startOfMonth } },
    });

    res.json({
      overview: { totalUsers, totalGroups, totalTopics, totalLogbooks, totalEvaluations },
      usersByRole, groupsByStatus, topicsByStatus,
      recentActivity: { submissionsLast7Days: recentSubmissions, evaluationsThisMonth: monthlyEvaluations },
    });
  } catch (error) { next(error); }
};

const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const department = req.query.department || req.user.department;
    const groups = await Group.findAll({
      where: department ? { department } : {},
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'status'] },
        { model: GroupMember, as: 'members', attributes: ['id'] },
      ],
    });

    const stats = {
      totalGroups: groups.length,
      byStatus: { not_started: 0, in_progress: 0, submitted: 0, evaluated: 0 },
      topicsApproved: 0, topicsPending: 0,
      avgGroupSize: 0,
    };

    let totalMembers = 0;
    groups.forEach(g => {
      stats.byStatus[g.status] = (stats.byStatus[g.status] || 0) + 1;
      if (g.topic) {
        if (g.topic.status === 'approved') stats.topicsApproved++;
        else stats.topicsPending++;
      }
      totalMembers += g.members ? g.members.length : 0;
    });
    stats.avgGroupSize = groups.length ? (totalMembers / groups.length).toFixed(1) : 0;

    res.json({ department, stats });
  } catch (error) { next(error); }
};

module.exports = { getSystemAnalytics, getDepartmentAnalytics };
