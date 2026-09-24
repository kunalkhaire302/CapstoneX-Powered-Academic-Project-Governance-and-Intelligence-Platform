const Joi = require('joi');

const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  // Group schemas
  createGroup: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    department: Joi.string().optional(),
    batch_year: Joi.number().integer().min(2020).max(2100).optional(),
    max_members: Joi.number().integer().min(1).max(10).optional(),
  }),
  joinGroup: Joi.object({
    join_code: Joi.string().trim().uppercase().pattern(/^(?:[A-Z0-9]{6}|[A-F0-9]{8})$/).required()
      .messages({ 'string.pattern.base': 'Enter a valid group join code.' }),
  }),

  // Topic schemas
  submitTopic: Joi.object({
    group_id: Joi.string().uuid().required(),
    topics: Joi.array().min(1).max(3).items(Joi.object({
      title: Joi.string().trim().min(5).max(300).required(),
      abstract: Joi.string().trim().min(20).max(10000).required(),
      domain_tags: Joi.array().items(Joi.string().trim().max(100)).max(10).default([]),
      technology_tags: Joi.array().items(Joi.string().trim().max(100)).max(20).default([]),
      file_url: Joi.string().uri().optional(),
    })).required(),
  }),

  // Logbook schemas
  createLogbook: Joi.object({
    group_id: Joi.string().uuid().required(),
    week_number: Joi.number().integer().min(1).max(20).required(),
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(10).required(),
    file_url: Joi.string().uri().optional(),
  })
};

module.exports = schemas;
