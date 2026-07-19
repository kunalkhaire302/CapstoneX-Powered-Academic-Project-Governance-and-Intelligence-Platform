const { getFirestoreDB } = require('../config/firebase');

/**
 * Get aggregated dashboard statistics for a student
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const db = getFirestoreDB();

    // 1. Groups Joined (Assuming 'group_members' collection)
    const groupMembersSnapshot = await db.collection('group_members')
      .where('student_id', '==', studentId)
      .where('status', '!=', 'rejected')
      .get();
    const groupsCount = groupMembersSnapshot.size;

    // 2. Logbooks Submitted (Assuming 'logbooks' collection)
    const logbooksSnapshot = await db.collection('logbooks')
      .where('student_id', '==', studentId)
      .get();
    const logbooksCount = logbooksSnapshot.size;

    // 3. Evaluations (Assuming 'evaluations' collection)
    const evaluationsSnapshot = await db.collection('evaluations')
      .where('student_id', '==', studentId)
      .get();
      
    let pendingEvaluationsCount = 0;
    let completedEvaluations = [];
    
    evaluationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.total_score == null) {
        pendingEvaluationsCount++;
      } else {
        completedEvaluations.push(data);
      }
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

    // 4. Recent Activity (Assuming 'notifications' collection)
    const notificationsSnapshot = await db.collection('notifications')
      .where('user_id', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
      
    const recentActivity = [];
    notificationsSnapshot.forEach(doc => {
      const data = doc.data();
      recentActivity.push({
        id: doc.id,
        action: data.title,
        time: data.createdAt ? data.createdAt.toDate() : new Date(),
        type: data.type,
      });
    });

    res.json({
      stats: {
        groupsJoined: groupsCount,
        logbooksSubmitted: logbooksCount,
        pendingEvaluations: pendingEvaluationsCount,
        overallScore: overallScore,
      },
      recentActivity
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard
};
