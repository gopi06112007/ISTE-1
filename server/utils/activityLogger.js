const ActivityLog = require('../models/ActivityLog');

/**
 * Log an activity to the ActivityLog collection.
 * Non-blocking — errors are caught and logged, never thrown.
 *
 * @param {Object} params
 * @param {string} params.action - Action type: 'CREATE', 'UPDATE', 'DELETE'
 * @param {string} params.performedBy - User ID of the actor
 * @param {string} params.targetModel - Model name: 'User', 'Profile', 'Event', 'Blog', 'Gallery'
 * @param {string} params.targetId - ID of the affected document
 * @param {string} params.details - Human-readable description
 */
const logActivity = async ({ action, performedBy, targetModel, targetId, details }) => {
  try {
    await ActivityLog.create({
      action,
      performedBy,
      targetModel,
      targetId,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    // Activity logging should never break the main flow
    console.error('Activity logging error:', error.message);
  }
};

module.exports = logActivity;
