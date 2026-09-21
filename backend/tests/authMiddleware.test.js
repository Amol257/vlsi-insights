const { describe, it } = require('node:test');
const assert = require('node:assert');

/**
 * Helper to dynamically load authMiddleware with a mocked supabase dependency.
 * @param {object|null} mockSupabase
 * @returns {object} { optionalAuth, requireAuth }
 */
function loadAuthMiddleware(mockSupabase) {
  const supabasePath = require.resolve('../src/config/supabase');
  const authMiddlewarePath = require.resolve('../src/middleware/authMiddleware');

  delete require.cache[supabasePath];
  delete require.cache[authMiddlewarePath];

  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: mockSupabase
  };

  return require('../src/middleware/authMiddleware');
}

/**
 * Helper to construct a mock Express response object.
 */
function createMockRes() {
  const res = {
    statusCode: null,
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
  return res;
}

describe('optionalAuth Middleware', () => {
  it('should call next() and leave req.user undefined when authorization header is missing', async () => {
    const { optionalAuth } = loadAuthMiddleware(null);
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
  });

  it('should call next() and leave req.user undefined when authorization header does not start with Bearer ', async () => {
    const { optionalAuth } = loadAuthMiddleware(null);
    const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
  });

  it('should call next() and leave req.user undefined when supabase client is null', async () => {
    const { optionalAuth } = loadAuthMiddleware(null);
    const req = { headers: { authorization: 'Bearer some-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
  });

  it('should populate req.user and call next() when supabase returns user successfully', async () => {
    const mockUser = { id: 'usr_123', email: 'test@example.com' };
    const mockSupabase = {
      auth: {
        getUser: async (token) => {
          assert.strictEqual(token, 'valid-token');
          return { data: { user: mockUser }, error: null };
        }
      }
    };

    const { optionalAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(req.user, mockUser);
  });

  it('should not populate req.user and call next() when supabase returns error response', async () => {
    const mockSupabase = {
      auth: {
        getUser: async () => {
          return { data: { user: null }, error: new Error('Invalid or expired token') };
        }
      }
    };

    const { optionalAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer expired-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
  });

  it('should handle supabase rejection gracefully and call next() (graceful pass-through try/catch)', async () => {
    const mockSupabase = {
      auth: {
        getUser: async () => {
          throw new Error('Supabase network connection failed');
        }
      }
    };

    const { optionalAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer token-causing-network-failure' } };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
  });
});

describe('requireAuth Middleware', () => {
  it('should return 401 when authorization header is missing', async () => {
    const { requireAuth } = loadAuthMiddleware(null);
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Authentication required. Missing or malformed Bearer token.');
  });

  it('should return 401 when authorization header is malformed', async () => {
    const { requireAuth } = loadAuthMiddleware(null);
    const req = { headers: { authorization: 'Basic token' } };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('should return 500 when supabase client is null', async () => {
    const { requireAuth } = loadAuthMiddleware(null);
    const req = { headers: { authorization: 'Bearer some-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Auth service not available on server.');
  });

  it('should return 401 when supabase returns error or null user', async () => {
    const mockSupabase = {
      auth: {
        getUser: async () => {
          return { data: { user: null }, error: { message: 'JWT expired' } };
        }
      }
    };

    const { requireAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer expired-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Invalid or expired session token.');
  });

  it('should populate req.user and call next() when valid token is provided', async () => {
    const mockUser = { id: 'usr_456', email: 'verified@example.com' };
    const mockSupabase = {
      auth: {
        getUser: async (token) => {
          assert.strictEqual(token, 'valid-token');
          return { data: { user: mockUser }, error: null };
        }
      }
    };

    const { requireAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.deepStrictEqual(req.user, mockUser);
  });

  it('should return 500 when supabase throws an exception', async () => {
    const mockSupabase = {
      auth: {
        getUser: async () => {
          throw new Error('Database connection reset');
        }
      }
    };

    const { requireAuth } = loadAuthMiddleware(mockSupabase);
    const req = { headers: { authorization: 'Bearer throw-token' } };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('Failed to verify auth session: Database connection reset'));
  });
});
