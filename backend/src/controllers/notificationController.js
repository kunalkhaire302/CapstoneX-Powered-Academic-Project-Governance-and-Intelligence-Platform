const { Notification, User } = {};
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const listNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = { user_id: req.user.id };
    if (req.query.read !== undefined) where.read = req.query.read === 'true';
    if (req.query.type) where.type = req.query.type;

    const { rows, count } = await Notification.findAndCountAll({
      where, order: [['created_at', 'DESC']], limit, offset,
    });
    const unreadCount = await Notification.count({ where: { user_id: req.user.id, read: false } });
    res.json({ ...paginatedResponse(rows, count, page, limit), unreadCount });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found.' });
    if (notification.user_id !== req.user.id) return res.status(403).json({ error: 'Not your notification.' });
    await notification.update({ read: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { user_id: req.user.id, read: false } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

const broadcast = async (req, res, next) => {
  try {
    const { title, body, type, target_role } = req.body;
    const where = { is_active: true };
    if (target_role) where.role = target_role;
    const users = await User.findAll({ where, attributes: ['id'] });
    const notifications = users.map(u => ({
      user_id: u.id, type: type || 'system', title, body, read: false,
    }));
    await Notification.bulkCreate(notifications);
    res.json({ message: `Broadcast sent to ${users.length} users.` });
  } catch (error) { next(error); }
};

const createNotification = async ({ userId, type, title, body, link }) => {
  try {
    await Notification.create({ user_id: userId, type, title, body, link });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead, broadcast, createNotification };
