const express = require('express');
const request = require('supertest');
const { loginLimiter, recoveryLimiter } = require('../src/middleware/rateLimiter');

test('blocks repeated failed login attempts with a retry header', async () => {
  const app = express();
  app.post('/login', loginLimiter, (_req, res) => res.status(401).json({ error: 'Invalid credentials' }));
  for (let attempt = 0; attempt < 10; attempt += 1) {
    expect((await request(app).post('/login')).status).toBe(401);
  }
  const response = await request(app).post('/login');
  expect(response.status).toBe(429);
  expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
});

test('blocks repeated password recovery attempts', async () => {
  const app = express();
  app.post('/recover', recoveryLimiter, (_req, res) => res.json({ ok: true }));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    expect((await request(app).post('/recover')).status).toBe(200);
  }
  expect((await request(app).post('/recover')).status).toBe(429);
});
