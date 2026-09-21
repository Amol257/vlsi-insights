const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const env = require('../src/config/env');

describe('CORS Security Policy', () => {
  let app;

  beforeEach(() => {
    // Clear module cache to allow fresh require if needed
    delete require.cache[require.resolve('../src/app')];
    app = require('../src/app');
  });

  it('allows configured frontend origin with credentials', async () => {
    const allowedOrigin = env.FRONTEND_URL[0];
    const res = await request(app)
      .get('/api/health')
      .set('Origin', allowedOrigin);

    assert.strictEqual(res.headers['access-control-allow-origin'], allowedOrigin);
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
  });

  it('allows requests without an Origin header', async () => {
    const res = await request(app)
      .get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
  });

  it('blocks unauthorized origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious.com');

    assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
  });

  it('blocks prefix matching bypass attempt', async () => {
    const maliciousOrigin = `${env.FRONTEND_URL[0]}.attacker.com`;
    const res = await request(app)
      .get('/api/health')
      .set('Origin', maliciousOrigin);

    assert.strictEqual(res.headers['access-control-allow-origin'], undefined);
  });

  it('blocks localhost origin in non-development environment', async () => {
    const originalEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';

    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:9999');

    assert.strictEqual(res.headers['access-control-allow-origin'], undefined);

    env.NODE_ENV = originalEnv;
  });

  it('allows localhost origin in development environment', async () => {
    const originalEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';

    const devOrigin = 'http://localhost:3000';
    const res = await request(app)
      .get('/api/health')
      .set('Origin', devOrigin);

    assert.strictEqual(res.headers['access-control-allow-origin'], devOrigin);

    env.NODE_ENV = originalEnv;
  });
});
