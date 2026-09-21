const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Helpers for mock req, res, next
function createMockReqRes({ authorization } = {}) {
  const req = {
    headers: {}
  };
  if (authorization !== undefined) {
    req.headers.authorization = authorization;
  }

  let statusCode = null;
  let jsonData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    }
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getResponseState: () => ({ statusCode, jsonData }),
    getNextCalled: () => nextCalled
  };
}

// Function to load authMiddleware with a specific supabase mock
function getMiddlewareWithSupabaseMock(mockSupabase) {
  const supabasePath = require.resolve('../src/config/supabase');
  const authMiddlewarePath = require.resolve('../src/middleware/authMiddleware');

  // Clear cache for both modules
  delete require.cache[supabasePath];
  delete require.cache[authMiddlewarePath];

  // Set mock in require.cache
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: mockSupabase
  };

  return require('../src/middleware/authMiddleware');
}

describe('authMiddleware', () => {
  describe('requireAuth', () => {
    test('rejects missing authorization header with 401', async () => {
      const { requireAuth } = getMiddlewareWithSupabaseMock({ auth: { getUser: async () => ({}) } });
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes();

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('rejects header not starting with Bearer (e.g. Basic token) with 401', async () => {
      const { requireAuth } = getMiddlewareWithSupabaseMock({ auth: { getUser: async () => ({}) } });
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Basic secret123' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('rejects empty header string with 401', async () => {
      const { requireAuth } = getMiddlewareWithSupabaseMock({ auth: { getUser: async () => ({}) } });
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: '' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('returns 500 if Supabase auth service is unavailable (null)', async () => {
      const { requireAuth } = getMiddlewareWithSupabaseMock(null);
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Bearer validtoken123' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 500);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Auth service not available on server.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('rejects with 401 when Supabase returns an error for invalid/expired token', async () => {
      const mockSupabase = {
        auth: {
          getUser: async (token) => {
            assert.strictEqual(token, 'invalid-token');
            return { data: { user: null }, error: new Error('Invalid JWT') };
          }
        }
      };
      const { requireAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Bearer invalid-token' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Invalid or expired session token.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('rejects with 401 when Supabase returns no user without error', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null })
        }
      };
      const { requireAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Bearer empty-user-token' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Invalid or expired session token.'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('returns 500 when Supabase getUser throws unexpected exception', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => {
            throw new Error('Database connection failed');
          }
        }
      };
      const { requireAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Bearer token123' });

      await requireAuth(req, res, next);

      const { statusCode, jsonData } = getResponseState();
      assert.strictEqual(statusCode, 500);
      assert.deepStrictEqual(jsonData, {
        success: false,
        error: 'Failed to verify auth session: Database connection failed'
      });
      assert.strictEqual(getNextCalled(), false);
    });

    test('authenticates successfully and attaches user to req when token is valid', async () => {
      const expectedUser = { id: 'user_123', email: 'test@vlsiinsights.com' };
      const mockSupabase = {
        auth: {
          getUser: async (token) => {
            assert.strictEqual(token, 'valid-token-abc');
            return { data: { user: expectedUser }, error: null };
          }
        }
      };
      const { requireAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getResponseState, getNextCalled } = createMockReqRes({ authorization: 'Bearer valid-token-abc' });

      await requireAuth(req, res, next);

      const { statusCode } = getResponseState();
      assert.strictEqual(statusCode, null); // status should not be set for success
      assert.deepStrictEqual(req.user, expectedUser);
      assert.strictEqual(getNextCalled(), true);
    });
  });

  describe('optionalAuth', () => {
    test('calls next() when authorization header is missing', async () => {
      const { optionalAuth } = getMiddlewareWithSupabaseMock({ auth: { getUser: async () => ({}) } });
      const { req, res, next, getNextCalled } = createMockReqRes();

      await optionalAuth(req, res, next);

      assert.strictEqual(req.user, undefined);
      assert.strictEqual(getNextCalled(), true);
    });

    test('calls next() when authorization header does not start with Bearer', async () => {
      const { optionalAuth } = getMiddlewareWithSupabaseMock({ auth: { getUser: async () => ({}) } });
      const { req, res, next, getNextCalled } = createMockReqRes({ authorization: 'Basic xyz' });

      await optionalAuth(req, res, next);

      assert.strictEqual(req.user, undefined);
      assert.strictEqual(getNextCalled(), true);
    });

    test('calls next() when Supabase client is null', async () => {
      const { optionalAuth } = getMiddlewareWithSupabaseMock(null);
      const { req, res, next, getNextCalled } = createMockReqRes({ authorization: 'Bearer token123' });

      await optionalAuth(req, res, next);

      assert.strictEqual(req.user, undefined);
      assert.strictEqual(getNextCalled(), true);
    });

    test('attaches user to req and calls next() when token is valid', async () => {
      const expectedUser = { id: 'user_456', email: 'optional@vlsiinsights.com' };
      const mockSupabase = {
        auth: {
          getUser: async (token) => {
            assert.strictEqual(token, 'valid-optional-token');
            return { data: { user: expectedUser }, error: null };
          }
        }
      };
      const { optionalAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getNextCalled } = createMockReqRes({ authorization: 'Bearer valid-optional-token' });

      await optionalAuth(req, res, next);

      assert.deepStrictEqual(req.user, expectedUser);
      assert.strictEqual(getNextCalled(), true);
    });

    test('calls next() gracefully without setting req.user when token is invalid or throws error', async () => {
      const mockSupabase = {
        auth: {
          getUser: async () => {
            throw new Error('Token verification failed');
          }
        }
      };
      const { optionalAuth } = getMiddlewareWithSupabaseMock(mockSupabase);
      const { req, res, next, getNextCalled } = createMockReqRes({ authorization: 'Bearer invalid-token' });

      await optionalAuth(req, res, next);

      assert.strictEqual(req.user, undefined);
      assert.strictEqual(getNextCalled(), true);
    });
  });
});
