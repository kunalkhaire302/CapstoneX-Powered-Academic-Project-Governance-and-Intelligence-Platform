const express = require('express');
const request = require('supertest');
const schemas = require('../src/utils/schemas');
const { validate } = require('../src/middleware/validator');

const app = express();
app.use(express.json());
app.post('/join', validate(schemas.joinGroup), (req, res) => res.json(req.body));
app.post('/topics', validate(schemas.submitTopic), (req, res) => res.status(201).json(req.body));

describe('project request contracts', () => {
  test.each(['a1b2c3d4', 'ALPHA1'])('accepts current and legacy join code %s', async code => {
    const response = await request(app).post('/join').send({ join_code: ` ${code} ` });
    expect(response.status).toBe(200);
    expect(response.body.join_code).toBe(code.toUpperCase());
  });

  test('rejects malformed join codes', async () => {
    expect((await request(app).post('/join').send({ join_code: '../admin' })).status).toBe(400);
  });

  const topic = { title: 'Accessible project governance', abstract: 'A project management platform supporting academic teams.' };
  const group_id = '00000000-0000-4000-8000-000000000001';
  test('preserves the topic array consumed by the controller', async () => {
    const response = await request(app).post('/topics').send({ group_id, topics: [topic] });
    expect(response.status).toBe(201);
    expect(response.body.topics[0].title).toBe(topic.title);
    expect(response.body.topics[0].domain_tags).toEqual([]);
  });
  test.each([{ topics: [] }, { topics: [topic, topic, topic, topic] }])('rejects an invalid topic batch size', async ({ topics }) => {
    expect((await request(app).post('/topics').send({ group_id, topics })).status).toBe(400);
  });
});
