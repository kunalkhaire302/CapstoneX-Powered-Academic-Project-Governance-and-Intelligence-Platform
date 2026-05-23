const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';
const isCloud = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

// Support DATABASE_URL (Neon, Render, Railway, etc.) or individual vars
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: isTest ? false : (msg) => console.log(`[SQL] ${msg}`),
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
      define: { timestamps: true, underscored: true, freezeTableName: true },
    })
  : new Sequelize(
      process.env.DB_NAME || 'capstonex_db',
      process.env.DB_USER || 'capstonex',
      process.env.DB_PASS || 'capstonex_pass',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: isTest ? false : (msg) => console.log(`[SQL] ${msg}`),
        dialectOptions: isCloud ? { ssl: { require: true, rejectUnauthorized: false } } : {},
        pool: { max: 20, min: 5, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true, freezeTableName: true },
      }
    );

module.exports = { sequelize, Sequelize };
