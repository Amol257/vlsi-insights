const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Helper to create mock res
function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

// Helper to load authMiddleware with a mocked supabase export
function loadMiddlewareWithSupabaseMock(mockSupabase) {
  const supabasePath = path.resolve(__dirname, '../src/config/supabase.js');
  const middlewarePath = path.resolve(__dirname, '../src/middleware/authMiddleware.js');

  // Clear module cache
  delete require.cache[supabasePath];
  delete require.cache[middlewarePath];

  // Mock supabase in require.cache
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: mockSupabase
  };

  return require('../src/middleware/authMiddleware.js');
}

describe('authMiddleware', () => {
  describe('requireAuth', () => {
    test('returns 401 if Authorization header is missing', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock({ auth: { getUser: async () => {} } });
      const req = { headers: {} };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(nextCalled, false);
    });

    test('returns 401 if Authorization header does not start with Bearer', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock({ auth: { getUser: async () => {} } });
      const req = { headers: { authorization: 'Basic 12345' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(nextCalled, false);
    });

    test('returns 401 if Bearer token is empty', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock({ auth: { getUser: async () => {} } });
      const req = { headers: { authorization: 'Bearer   ' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(nextCalled, false);
    });

    test('returns 503 if Supabase client is unavailable (null)', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock(null);
      const req = { headers: { authorization: 'Bearer valid.jwt.token' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Auth service not available on server.');
      assert.strictEqual(nextCalled, false);
    });

    test('returns 401 if Supabase getUser returns error or null data', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock({
        auth: {
          getUser: async () => ({ data: null, error: { message: 'Invalid token' } })
        }
      });
      const req = { headers: { authorization: 'Bearer invalid.token' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Invalid or expired session token.');
      assert.strictEqual(nextCalled, false);
    });

    test('returns 401 without leaking internal exception when getUser throws', async () => {
      const { requireAuth } = loadMiddlewareWithSupabaseMock({
        auth: {
          getUser: async () => { throw new Error('Database network connection timeout secret_internal_db_host:5432'); }
        }
      });
      const req = { headers: { authorization: 'Bearer some.token' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Invalid or expired session token.');
      assert.strictEqual(res.body.error.includes('secret_internal_db_host'), false);
      assert.strictEqual(nextCalled, false);
    });

    test('sets req.user and calls next() on valid token', async () => {
      const mockUser = { id: 'usr_123', email: 'student@example.com' };
      const { requireAuth } = loadMiddlewareWithSupabaseMock({
        auth: {
          getUser: async (token) => {
            if (token === 'valid.token.here') {
              return { data: { user: mockUser }, error: null };
            }
            return { data: null, error: new Error('bad token') };
          }
        }
      });
      const req = { headers: { authorization: 'Bearer valid.token.here' } };
      const res = mockRes();
      let nextCalled = false;

      await requireAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.deepStrictEqual(req.user, mockUser);
      assert.strictEqual(res.statusCode, 200);
    });
  });

  describe('optionalAuth', () => {
    test('passes through to next() without setting req.user if header missing', async () => {
      const { optionalAuth } = loadMiddlewareWithSupabaseMock({ auth: { getUser: async () => {} } });
      const req = { headers: {} };
      const res = mockRes();
      let nextCalled = false;

      await optionalAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });

    test('passes through to next() without setting req.user if token is empty', async () => {
      const { optionalAuth } = loadMiddlewareWithSupabaseMock({ auth: { getUser: async () => {} } });
      const req = { headers: { authorization: 'Bearer  ' } };
      const res = mockRes();
      let nextCalled = false;

      await optionalAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });

    test('passes through to next() without error if data is null from getUser', async () => {
      const { optionalAuth } = loadMiddlewareWithSupabaseMock({
        auth: {
          getUser: async () => ({ data: null, error: { message: 'Invalid token' } })
        }
      });
      const req = { headers: { authorization: 'Bearer invalid.token' } };
      const res = mockRes();
      let nextCalled = false;

      await optionalAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });

    test('populates req.user if valid token provided', async () => {
      const mockUser = { id: 'usr_456', email: 'guest_user@example.com' };
      const { optionalAuth } = loadMiddlewareWithSupabaseMock({
        auth: {
          getUser: async () => ({ data: { user: mockUser }, error: null })
        }
      });
      const req = { headers: { authorization: 'Bearer valid.token' } };
      const res = mockRes();
      let nextCalled = false;

      await optionalAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.deepStrictEqual(req.user, mockUser);
    });
  });
});
