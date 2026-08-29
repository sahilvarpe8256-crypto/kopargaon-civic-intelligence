const request = require('supertest');
const app = require('../../src/app');

describe('Auth Integration API & Security Hardening', () => {
  let officerToken = '';

  it('POST /api/auth/login - should authenticate supervisor demo account in non-production', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'supervisor@kopargaon.gov.in',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('supervisor');

    officerToken = res.body.data.token;
  });

  it('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me - should return authenticated user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('supervisor@kopargaon.gov.in');
    expect(res.body.data.user.role).toBe('supervisor');
  });

  it('GET /api/auth/me - should reject request without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me - should reject request with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register - should create citizen account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Kopargaon Citizen',
        email: `citizen_${Date.now()}@example.com`,
        phone: '9876543210'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('citizen');
  });
});