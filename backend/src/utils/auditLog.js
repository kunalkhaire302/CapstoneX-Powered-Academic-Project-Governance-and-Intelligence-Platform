const { getFirestoreDB } = require('../config/firebase');
const logger = require('./logger');

/**
 * Create an audit log entry for state-changing actions.
 * @param {object} options
 * @param {string} options.userId - ID of the user performing the action
 * @param {string} options.action - Action performed (e.g., 'user.created', 'topic.approved')
 * @param {string} options.entityType - Type of entity affected (e.g., 'user', 'group', 'topic')
 * @param {string} options.entityId - ID of the affected entity
 * @param {object} options.metadata - Additional metadata
 * @param {string} options.ipAddress - IP address of the request
 */
const createAuditLog = async ({ userId, action, entityType, entityId, metadata = {}, ipAddress }) => {
  try {
    const db = getFirestoreDB();
    if (!db) {
      logger.error('Failed to create audit log: Firestore not initialized');
      return;
    }
    
    await db.collection('audit_logs').add({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata_json: metadata,
      ip_address: ipAddress || '',
      created_at: new Date()
    });
  } catch (error) {
    // Don't throw — audit logging should never break the main flow
    logger.error('Failed to create audit log:', error.message);
  }
};

module.exports = { createAuditLog };
