const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  development: {
    username: process.env.DB_USER || 'capstonex',
    password: process.env.DB_PASS || 'capstonex_pass',
    database: process.env.DB_NAME || 'capstonex_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  },
  test: {
    username: process.env.DB_USER || 'capstonex',
    password: process.env.DB_PASS || 'capstonex_pass',
    database: 'capstonex_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  },
};
