const request = require('supertest');
const app = require('../../src/app');

describe('Reports & Dashboard API Integration Tests', () => {
  it('GET /api/health returns 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/reports creates, assesses, and prioritizes a new report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        latitude: 19.8845,
        longitude: 74.4671,
        description: 'Hospital medical syringes and packaging dumped near market drain',
        category: 'waste_management'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportId).toMatch(/^RPT-\d{8}-\d{4}$/);
    expect(res.body.data.zoneId).toBe('Z01');
    expect(res.body.data.priorityScore).toBeGreaterThan(0);
    expect(res.body.data.priorityReasons).toBeDefined();
  });

  it('POST /api/reports rejects missing coordinates with 400', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        description: 'Missing coordinates'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/dashboard/resources returns municipal resource status', async () => {
    const res = await request(app).get('/api/dashboard/resources');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.crews).toBeDefined();
    expect(res.body.data.vehicles).toBeDefined();
  });

  it('POST /api/dashboard/prioritize runs allocation engine', async () => {
    const res = await request(app).post('/api/dashboard/prioritize');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
  });

  it('POST /api/auth/login authenticates municipal officer', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'officer@kopargaon.gov.in',
        password: 'officer123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('officer');
  });
});