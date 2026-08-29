const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/health Integration Tests', () => {
  it('1. GET /api/health returns HTTP 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('2. Response is JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('3. success is true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.success).toBe(true);
  });

  it('4. status is "ok"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('ok');
  });

  it('5. service name is correct', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.service).toBe('Kopargaon Civic Intelligence Backend');
  });

  it('6. timestamp is present and valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toBeDefined();
    const parsedDate = new Date(res.body.timestamp);
    expect(!isNaN(parsedDate.getTime())).toBe(true);
    expect(parsedDate.toISOString()).toBe(res.body.timestamp);
  });

  it('7. An unknown API route returns HTTP 404 with structured JSON', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/non-existent-route'
      }
    });
  });
});

describe('CORS and Error Handling Hardening Tests', () => {
  it('allows requests from configured allowed origin (http://localhost:3000)', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('allows requests from configured allowed origin (http://localhost:5173)', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('rejects requests from disallowed origins without exposing stack trace', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://unauthorized-domain.com');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message', 'Not allowed by CORS');
    expect(res.body.error.stack).toBeUndefined();
  });

  it('ensures unexpected 500 errors return safe structured JSON without stack traces', async () => {
    const express = require('express');
    const { errorHandler } = require('../../src/middleware/errorHandler');
    
    // Create an isolated test express app with an intentionally crashing route
    const testApp = express();
    testApp.get('/test-crash', (req, res, next) => {
      next(new Error('Simulated database corruption failure with /var/secret/path'));
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/test-crash');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal Server Error'
      }
    });
    expect(res.body.error.stack).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('/var/secret/path');
  });
});