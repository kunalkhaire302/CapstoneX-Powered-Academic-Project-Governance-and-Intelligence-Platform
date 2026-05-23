/**
 * Pagination helper utility.
 * Provides standardized pagination for all list endpoints.
 */

/**
 * Parse pagination parameters from query string.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Format paginated response.
 * @param {object[]} rows - Data rows
 * @param {number} count - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
const paginatedResponse = (rows, count, page, limit) => {
  const totalPages = Math.ceil(count / limit);
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Parse sorting parameters.
 * @param {string} sortBy - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @param {string[]} allowedFields - Whitelist of sortable fields
 * @returns {Array} Sequelize order clause
 */
const parseSort = (sortBy, order, allowedFields) => {
  const field = allowedFields.includes(sortBy) ? sortBy : 'created_at';
  const direction = order === 'asc' ? 'ASC' : 'DESC';
  return [[field, direction]];
};

module.exports = { parsePagination, paginatedResponse, parseSort };
