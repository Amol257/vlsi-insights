const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const supabaseService = require('../../src/services/supabaseService');
const { submitEnrollmentHandler } = require('../../src/controllers/enrollmentController');

function createMockRes() {
  const res = {
    statusCode: null,
    jsonBody: null
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.jsonBody = body;
    return res;
  };
  return res;
}

describe('enrollmentController - submitEnrollmentHandler', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('Validation errors (400 Bad Request)', () => {
    it('should return 400 if name is missing', async () => {
      const req = {
        body: {
          email: 'john@example.com',
          program: 'VLSI Design'
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.deepStrictEqual(res.jsonBody, {
        success: false,
        error: 'Name, email, and program are required'
      });
      assert.strictEqual(nextCalled, false);
    });

    it('should return 400 if email is missing', async () => {
      const req = {
        body: {
          name: 'John Doe',
          program: 'VLSI Design'
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.deepStrictEqual(res.jsonBody, {
        success: false,
        error: 'Name, email, and program are required'
      });
      assert.strictEqual(nextCalled, false);
    });

    it('should return 400 if program is missing', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.deepStrictEqual(res.jsonBody, {
        success: false,
        error: 'Name, email, and program are required'
      });
      assert.strictEqual(nextCalled, false);
    });

    it('should return 400 if email format is invalid', async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'invalid-email-address',
          program: 'VLSI Design'
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.deepStrictEqual(res.jsonBody, {
        success: false,
        error: 'Please provide a valid email address'
      });
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('Successful enrollment submission (200 OK)', () => {
    it('should trim inputs, convert email to lowercase, default source to programs_page, and return 200', async () => {
      const expectedRecord = { id: 101, name: 'John Doe', program: 'VLSI Design' };
      let saveCalledWith = null;

      mock.method(supabaseService, 'saveEnrollmentSubmission', async (payload) => {
        saveCalledWith = payload;
        return expectedRecord;
      });

      const req = {
        body: {
          name: '  John Doe  ',
          email: '  JOHN.DOE@EXAMPLE.COM  ',
          program: '  VLSI Design  '
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonBody, {
        success: true,
        message: 'Application received successfully! Our academic counseling team will reach out with the syllabus.',
        data: expectedRecord
      });
      assert.deepStrictEqual(saveCalledWith, {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: null,
        program: 'VLSI Design',
        degree: null,
        gradYear: null,
        source: 'programs_page'
      });
      assert.strictEqual(nextCalled, false);
    });

    it('should trim optional fields and pass custom source when provided', async () => {
      const expectedRecord = { id: 102, name: 'Jane Smith' };
      let saveCalledWith = null;

      mock.method(supabaseService, 'saveEnrollmentSubmission', async (payload) => {
        saveCalledWith = payload;
        return expectedRecord;
      });

      const req = {
        body: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '  +1234567890  ',
          program: 'SoC Verification',
          degree: '  B.Tech  ',
          gradYear: '  2025  ',
          source: 'landing_banner'
        }
      };
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.jsonBody, {
        success: true,
        message: 'Application received successfully! Our academic counseling team will reach out with the syllabus.',
        data: expectedRecord
      });
      assert.deepStrictEqual(saveCalledWith, {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        program: 'SoC Verification',
        degree: 'B.Tech',
        gradYear: '2025',
        source: 'landing_banner'
      });
      assert.strictEqual(nextCalled, false);
    });
  });

  describe('Error handling', () => {
    it('should forward error to next() when supabaseService throws an exception', async () => {
      const dbError = new Error('Database connection failed');
      mock.method(supabaseService, 'saveEnrollmentSubmission', async () => {
        throw dbError;
      });

      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          program: 'VLSI Design'
        }
      };
      const res = createMockRes();
      let capturedError = null;
      const next = (err) => {
        capturedError = err;
      };

      await submitEnrollmentHandler(req, res, next);

      assert.strictEqual(res.statusCode, null);
      assert.strictEqual(res.jsonBody, null);
      assert.strictEqual(capturedError, dbError);
    });
  });
});
