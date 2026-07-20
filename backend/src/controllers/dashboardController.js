const { Op } = require('sequelize');
const { GroupMember, Logbook, Evaluation, Notification } = require('../models');

/**
 * Get aggregated dashboard statistics for a student
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // 1. Groups Joined
    const groupsCount = await GroupMember.count({
      where: { student_id: studentId, status: { [Op.not]: 'rejected' } }
    });

    // 2. Logbooks Submitted
    const logbooksCount = await Logbook.count({
      where: { student_id: studentId }
    });

    // 3. Evaluations (Pending vs Completed)
    const pendingEvaluationsCount = await Evaluation.count({
      where: { student_id: studentId, total_score: null }
    });
    
    // Calculate overall score (average of completed evaluations)
    const completedEvaluations = await Evaluation.findAll({
      where: { student_id: studentId, total_score: { [Op.ne]: null } },
      attributes: ['total_score', 'max_score']
    });
    
    let overallScore = 0;
    if (completedEvaluations.length > 0) {
      let totalEarned = 0;
      let totalMax = 0;
      completedEvaluations.forEach(ev => {
        totalEarned += ev.total_score || 0;
        totalMax += ev.max_score || 100;
      });
      overallScore = Math.round((totalEarned / totalMax) * 100);
    }

    // 4. Recent Activity (Notifications)
    const recentActivity = await Notification.findAll({
      where: { user_id: studentId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'body', 'type', 'createdAt']
    });

    res.json({
      stats: {
        groupsJoined: groupsCount,
        logbooksSubmitted: logbooksCount,
        pendingEvaluations: pendingEvaluationsCount,
        overallScore: overallScore,
      },
      recentActivity: recentActivity.map(n => ({
        id: n.id,
        action: n.title,
        time: n.createdAt,
        type: n.type,
      }))
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard
};
