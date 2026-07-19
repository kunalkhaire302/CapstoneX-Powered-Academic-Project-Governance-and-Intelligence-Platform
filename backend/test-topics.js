require('dotenv').config({ path: 'k:/assignment/6SEM/2026_Projects/CapstoneX/backend/.env' });
const { sequelize } = require('./src/models');

async function test() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Success! Database schemas have been fully altered and synchronized.");
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit(0);
}

test();
