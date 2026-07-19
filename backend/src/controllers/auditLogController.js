const { AuditLog, User } = {};
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { Op } = require('sequelize');

const listAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.action) where.action = { [Op.iLike]: `%${req.query.action}%` };
    if (req.query.user_id) where.user_id = req.query.user_id;
    if (req.query.entity_type) where.entity_type = req.query.entity_type;
    if (req.query.from_date) where.created_at = { ...where.created_at, [Op.gte]: new Date(req.query.from_date) };
    if (req.query.to_date) where.created_at = { ...where.created_at, [Op.lte]: new Date(req.query.to_date) };

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['created_at', 'DESC']], limit, offset, distinct: true,
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (error) { next(error); }
};

module.exports = { listAuditLogs };
