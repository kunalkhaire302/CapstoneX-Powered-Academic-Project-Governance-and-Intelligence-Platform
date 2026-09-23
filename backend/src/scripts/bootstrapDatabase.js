'use strict';

const { sequelize, Sequelize, User } = require('../models');
const demoDataSeeder = require('../seeders/20240101000001-demo-data');

const MIGRATIONS_REPRESENTED_BY_MODELS = [
  '20260523153550-add-performance-indexes.js',
  '20260922000000-create-agent-team.js',
];

async function tableExists(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) => {
    const name = typeof table === 'string' ? table : table.tableName;
    return String(name).toLowerCase() === tableName.toLowerCase();
  });
}

async function ensureMigrationMetadata(queryInterface) {
  if (!(await tableExists(queryInterface, 'SequelizeMeta'))) {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    });
  }

  await sequelize.query(
    'INSERT INTO "SequelizeMeta" ("name") VALUES (:performance), (:agents) ON CONFLICT ("name") DO NOTHING',
    {
      replacements: {
        performance: MIGRATIONS_REPRESENTED_BY_MODELS[0],
        agents: MIGRATIONS_REPRESENTED_BY_MODELS[1],
      },
    }
  );
}

async function bootstrapDatabase() {
  const queryInterface = sequelize.getQueryInterface();
  let lockAcquired = false;

  try {
    await sequelize.authenticate();
    await sequelize.query("SELECT pg_advisory_lock(hashtext('capstonex_database_bootstrap'))");
    lockAcquired = true;

    if (await tableExists(queryInterface, 'users')) {
      console.log('[database] Existing schema detected; bootstrap skipped.');
      return;
    }

    console.log('[database] Empty database detected; creating the CapstoneX schema.');
    await sequelize.sync();

    // A fresh schema generated from the current models already includes the
    // structures and indexes introduced by these historical migrations.
    await ensureMigrationMetadata(queryInterface);

    if (await User.count() === 0) {
      console.log('[database] Loading Quick Access Demo data.');
      await demoDataSeeder.up(queryInterface);
    }

    console.log('[database] Initial schema and demo data are ready.');
  } finally {
    if (lockAcquired) {
      await sequelize.query("SELECT pg_advisory_unlock(hashtext('capstonex_database_bootstrap'))");
    }
    await sequelize.close();
  }
}

bootstrapDatabase().catch((error) => {
  console.error('[database] Bootstrap failed:', error.message);
  process.exitCode = 1;
});
