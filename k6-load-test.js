import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users over 30 seconds
    { duration: '1m', target: 50 },  // Stay at 50 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://127.0.0.1:5000/api';

export default function () {
  // Test Health Endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Test Public Groups Listing (Testing DB Pagination Performance)
  const groupsRes = http.get(`${BASE_URL}/groups?page=1&limit=20`);
  check(groupsRes, {
    'groups listing status is 200': (r) => r.status === 200,
    'groups listing returns data': (r) => JSON.parse(r.body).data !== undefined,
  });

  sleep(1);
}
