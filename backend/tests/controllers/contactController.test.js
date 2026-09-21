const { submitContactHandler } = require('../../src/controllers/contactController');
const supabaseService = require('../../src/services/supabaseService');

jest.mock('../../src/services/supabaseService');

describe('contactController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('submitContactHandler', () => {
    it('should return 400 if name is missing', async () => {
      req.body = {
        email: 'test@example.com',
        message: 'Hello'
      };

      await submitContactHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name, email, and message are required fields'
      });
      expect(supabaseService.saveContactSubmission).not.toHaveBeenCalled();
    });

    it('should return 400 if email is missing', async () => {
      req.body = {
        name: 'John Doe',
        message: 'Hello'
      };

      await submitContactHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name, email, and message are required fields'
      });
      expect(supabaseService.saveContactSubmission).not.toHaveBeenCalled();
    });

    it('should return 400 if message is missing', async () => {
      req.body = {
        name: 'John Doe',
        email: 'test@example.com'
      };

      await submitContactHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name, email, and message are required fields'
      });
      expect(supabaseService.saveContactSubmission).not.toHaveBeenCalled();
    });

    it('should return 400 if email is invalid', async () => {
      req.body = {
        name: 'John Doe',
        email: 'not-an-email',
        message: 'Hello'
      };

      await submitContactHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Please provide a valid email address'
      });
      expect(supabaseService.saveContactSubmission).not.toHaveBeenCalled();
    });

    it('should successfully save contact submission with all fields', async () => {
      const mockSubmission = {
        id: 'contact_123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'Need info',
        source: 'custom_page',
        created_at: new Date().toISOString()
      };

      supabaseService.saveContactSubmission.mockResolvedValue(mockSubmission);

      req.body = {
        name: '  John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        phone: '  +1234567890  ',
        message: '  Need info  ',
        source: 'custom_page'
      };

      await submitContactHandler(req, res, next);

      expect(supabaseService.saveContactSubmission).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: 'Need info',
        source: 'custom_page'
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thank you! Your message has been received. We'll be in touch within 24 hours.",
        data: mockSubmission
      });
    });

    it('should use default source and set phone to null when optional fields are omitted', async () => {
      const mockSubmission = {
        id: 'contact_456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
        message: 'Inquiry',
        source: 'website_contact',
        created_at: new Date().toISOString()
      };

      supabaseService.saveContactSubmission.mockResolvedValue(mockSubmission);

      req.body = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Inquiry'
      };

      await submitContactHandler(req, res, next);

      expect(supabaseService.saveContactSubmission).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
        message: 'Inquiry',
        source: 'website_contact'
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thank you! Your message has been received. We'll be in touch within 24 hours.",
        data: mockSubmission
      });
    });

    it('should pass error to next middleware when supabaseService throws', async () => {
      const error = new Error('Database connection failed');
      supabaseService.saveContactSubmission.mockRejectedValue(error);

      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello'
      };

      await submitContactHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
