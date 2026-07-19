require('dotenv').config();
const { sequelize } = require('./src/models');

async function fix() {
  try {
    await sequelize.query('ALTER TABLE groups ALTER COLUMN status TYPE VARCHAR(50) USING status::varchar');
    console.log("Altered groups.status");
  } catch (err) { console.error(err.message); }
  
  try {
    await sequelize.query('ALTER TABLE group_members ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'pending\'');
    console.log("Altered group_members.status");
  } catch (err) { console.error(err.message); }

  try {
    await sequelize.query('ALTER TABLE topics ALTER COLUMN status TYPE VARCHAR(50) USING status::varchar');
    console.log("Altered topics.status");
  } catch (err) { console.error(err.message); }

  try {
    await sequelize.query('ALTER TABLE logbooks ALTER COLUMN status TYPE VARCHAR(50) USING status::varchar');
    console.log("Altered logbooks.status");
  } catch (err) { console.error(err.message); }

  process.exit(0);
}

fix();
