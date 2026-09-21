const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('errorHandler Middleware Security Tests', () => {
  let consoleErrorOutput = [];
  const originalConsoleError = console.error;

  beforeEach(() => {
    consoleErrorOutput = [];
    console.error = (...args) => {
      consoleErrorOutput.push(args);
    };
  });

  afterEach(() => {
    console.error = originalConsoleError;
    delete require.cache[require.resolve('../src/config/env')];
    delete require.cache[require.resolve('../src/middleware/errorHandler')];
  });

  function createMockRes() {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    return res;
  }

  test('does NOT expose stack trace when EXPOSE_STACK_TRACE is false (even in development)', () => {
    process.env.NODE_ENV = 'development';
    process.env.EXPOSE_STACK_TRACE = 'false';

    const env = require('../src/config/env');
    const errorHandler = require('../src/middleware/errorHandler');

    assert.strictEqual(env.EXPOSE_STACK_TRACE, false);

    const err = new Error('Sensitive database connection failure');
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.jsonData, {
      success: false,
      error: 'Sensitive database connection failure'
    });
    assert.strictEqual(res.jsonData.stack, undefined);
  });

  test('does NOT expose stack trace when EXPOSE_STACK_TRACE is unset by default', () => {
    delete process.env.EXPOSE_STACK_TRACE;
    process.env.NODE_ENV = 'development';

    const env = require('../src/config/env');
    const errorHandler = require('../src/middleware/errorHandler');

    assert.strictEqual(env.EXPOSE_STACK_TRACE, false);

    const err = new Error('Unhandled exception');
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.jsonData.stack, undefined);
  });

  test('exposes stack trace ONLY when EXPOSE_STACK_TRACE is explicitly set to true', () => {
    process.env.EXPOSE_STACK_TRACE = 'true';

    const env = require('../src/config/env');
    const errorHandler = require('../src/middleware/errorHandler');

    assert.strictEqual(env.EXPOSE_STACK_TRACE, true);

    const err = new Error('Explicit debug error');
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.error, 'Explicit debug error');
    assert.ok(typeof res.jsonData.stack === 'string');
    assert.ok(res.jsonData.stack.includes('Explicit debug error'));
  });

  test('uses status or statusCode from error object if provided', () => {
    delete process.env.EXPOSE_STACK_TRACE;

    const errorHandler = require('../src/middleware/errorHandler');

    const err1 = new Error('Bad Request');
    err1.status = 400;
    const res1 = createMockRes();
    errorHandler(err1, {}, res1, () => {});
    assert.strictEqual(res1.statusCode, 400);

    const err2 = new Error('Unauthorized');
    err2.statusCode = 401;
    const res2 = createMockRes();
    errorHandler(err2, {}, res2, () => {});
    assert.strictEqual(res2.statusCode, 401);
  });

  test('defaults message to Internal Server Error if err.message is missing', () => {
    delete process.env.EXPOSE_STACK_TRACE;

    const errorHandler = require('../src/middleware/errorHandler');

    const err = {};
    const res = createMockRes();
    errorHandler(err, {}, res, () => {});

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.jsonData.error, 'Internal Server Error');
  });

  test('logs error server-side via console.error regardless of EXPOSE_STACK_TRACE setting', () => {
    delete process.env.EXPOSE_STACK_TRACE;

    const errorHandler = require('../src/middleware/errorHandler');

    const err = new Error('Server side logged error');
    const res = createMockRes();

    errorHandler(err, {}, res, () => {});

    assert.strictEqual(consoleErrorOutput.length, 1);
    assert.strictEqual(consoleErrorOutput[0][0], '[API Error]');
    assert.strictEqual(consoleErrorOutput[0][1], err.stack);
  });
});
