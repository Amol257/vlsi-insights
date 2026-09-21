describe('SupabaseService', () => {
  let supabaseService;
  let mockSingle;
  let mockSelect;
  let mockInsert;
  let mockUpdate;
  let mockEq;
  let mockFrom;
  let mockSupabaseClient;

  beforeEach(() => {
    jest.resetModules();

    mockSingle = jest.fn();
    mockSelect = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockEq = jest.fn();
    mockFrom = jest.fn();

    mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate
    });
    mockInsert.mockReturnValue({
      select: mockSelect
    });
    mockUpdate.mockReturnValue({
      eq: mockEq
    });
    mockEq.mockReturnValue({
      select: mockSelect
    });
    mockSelect.mockReturnValue({
      single: mockSingle
    });

    mockSupabaseClient = {
      from: mockFrom
    };
  });

  describe('when Supabase client is configured', () => {
    beforeEach(() => {
      jest.doMock('../../src/config/supabase', () => mockSupabaseClient);
      supabaseService = require('../../src/services/supabaseService');
    });

    describe('recordOrder', () => {
      const sampleOrder = {
        orderId: 'order_123',
        userId: 'user_456',
        items: [{ id: 1, quantity: 2 }],
        totals: { subtotal: 100, discount: 10, tax: 5, total: 95 },
        promoCode: 'SAVE10',
        status: 'created'
      };

      test('successfully records an order', async () => {
        const mockResult = { id: 1, order_id: 'order_123', status: 'created' };
        mockSingle.mockResolvedValueOnce({ data: mockResult, error: null });

        const result = await supabaseService.recordOrder(sampleOrder);

        expect(mockFrom).toHaveBeenCalledWith('orders');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          order_id: 'order_123',
          user_id: 'user_456',
          items: sampleOrder.items,
          subtotal: 100,
          discount: 10,
          tax: 5,
          total: 95,
          promo_code: 'SAVE10',
          status: 'created'
        }));
        expect(mockSelect).toHaveBeenCalled();
        expect(mockSingle).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
      });

      test('handles default parameters for userId, promoCode, status', async () => {
        const minimalOrder = {
          orderId: 'order_min',
          items: [],
          totals: { subtotal: 50, discount: 0, tax: 0, total: 50 }
        };

        mockSingle.mockResolvedValueOnce({ data: { id: 2 }, error: null });

        await supabaseService.recordOrder(minimalOrder);

        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          order_id: 'order_min',
          user_id: null,
          promo_code: null,
          status: 'created'
        }));
      });

      test('returns warning object when database insert returns an error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Table error' } });

        const result = await supabaseService.recordOrder(sampleOrder);

        expect(result).toEqual({
          orderId: 'order_123',
          status: 'created',
          warning: 'Table error'
        });
      });

      test('returns error object when an exception is thrown', async () => {
        mockFrom.mockImplementationOnce(() => {
          throw new Error('Database connection failed');
        });

        const result = await supabaseService.recordOrder(sampleOrder);

        expect(result).toEqual({
          orderId: 'order_123',
          status: 'created',
          error: 'Database connection failed'
        });
      });
    });

    describe('updateOrderStatusPaid', () => {
      const updateParams = {
        orderId: 'order_123',
        paymentId: 'pay_789',
        signature: 'sig_abc'
      };

      test('successfully updates order status to paid', async () => {
        const mockResult = { order_id: 'order_123', status: 'paid', payment_id: 'pay_789' };
        mockSingle.mockResolvedValueOnce({ data: mockResult, error: null });

        const result = await supabaseService.updateOrderStatusPaid(updateParams);

        expect(mockFrom).toHaveBeenCalledWith('orders');
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
          status: 'paid',
          payment_id: 'pay_789',
          signature: 'sig_abc'
        }));
        expect(mockEq).toHaveBeenCalledWith('order_id', 'order_123');
        expect(result).toEqual(mockResult);
      });

      test('returns warning object when update query returns an error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } });

        const result = await supabaseService.updateOrderStatusPaid(updateParams);

        expect(result).toEqual({
          orderId: 'order_123',
          status: 'paid',
          warning: 'Update failed'
        });
      });

      test('returns error object when an exception is thrown', async () => {
        mockFrom.mockImplementationOnce(() => {
          throw new Error('Network error');
        });

        const result = await supabaseService.updateOrderStatusPaid(updateParams);

        expect(result).toEqual({
          orderId: 'order_123',
          status: 'paid',
          error: 'Network error'
        });
      });
    });

    describe('saveContactSubmission', () => {
      const contactParams = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Hello world',
        source: 'contact_page'
      };

      test('successfully saves contact submission', async () => {
        const mockData = [{ id: 10, name: 'John Doe' }];
        mockSelect.mockResolvedValueOnce({ data: mockData, error: null });

        const result = await supabaseService.saveContactSubmission(contactParams);

        expect(mockFrom).toHaveBeenCalledWith('contact_submissions');
        expect(mockInsert).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          message: '[contact_page] Hello world'
        });
        expect(result).toEqual(mockData[0]);
      });

      test('handles default source and optional phone', async () => {
        mockSelect.mockResolvedValueOnce({ data: [], error: null });

        const result = await supabaseService.saveContactSubmission({
          name: 'Jane',
          email: 'jane@example.com',
          message: 'Hi'
        });

        expect(mockInsert).toHaveBeenCalledWith({
          name: 'Jane',
          email: 'jane@example.com',
          phone: null,
          message: '[website] Hi'
        });
        expect(result).toEqual({ success: true });
      });

      test('throws Error when insertion returns error', async () => {
        mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

        await expect(supabaseService.saveContactSubmission(contactParams))
          .rejects.toThrow('Insert failed');
      });
    });

    describe('saveEnrollmentSubmission', () => {
      const enrollmentParams = {
        name: 'Alice',
        email: 'alice@example.com',
        phone: '9876543210',
        program: 'VLSI Design',
        degree: 'B.Tech',
        gradYear: '2024',
        source: 'enrollment_form'
      };

      test('successfully saves enrollment submission', async () => {
        const mockData = [{ id: 20, name: 'Alice' }];
        mockSelect.mockResolvedValueOnce({ data: mockData, error: null });

        const result = await supabaseService.saveEnrollmentSubmission(enrollmentParams);

        expect(mockFrom).toHaveBeenCalledWith('enrollment_submissions');
        expect(mockInsert).toHaveBeenCalledWith({
          name: 'Alice',
          email: 'alice@example.com',
          phone: '9876543210',
          program: 'VLSI Design',
          message: 'Source: enrollment_form | Degree: B.Tech | Grad Year: 2024'
        });
        expect(result).toEqual(mockData[0]);
      });

      test('handles missing optional fields and returns fallback object', async () => {
        mockSelect.mockResolvedValueOnce({ data: null, error: null });

        const result = await supabaseService.saveEnrollmentSubmission({
          name: 'Bob',
          email: 'bob@example.com',
          program: 'Embedded Systems'
        });

        expect(mockInsert).toHaveBeenCalledWith({
          name: 'Bob',
          email: 'bob@example.com',
          phone: null,
          program: 'Embedded Systems',
          message: 'Source: enrollment_form'
        });
        expect(result).toEqual({ success: true });
      });

      test('throws Error when insertion returns error', async () => {
        mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Enrollment error' } });

        await expect(supabaseService.saveEnrollmentSubmission(enrollmentParams))
          .rejects.toThrow('Enrollment error');
      });
    });
  });

  describe('when Supabase client is unconfigured (supabase = null)', () => {
    beforeEach(() => {
      jest.doMock('../../src/config/supabase', () => null);
      supabaseService = require('../../src/services/supabaseService');
    });

    test('recordOrder handles null supabase client', async () => {
      const result = await supabaseService.recordOrder({ orderId: 'ord_1', status: 'created' });
      expect(result).toEqual({ orderId: 'ord_1', status: 'created' });
    });

    test('updateOrderStatusPaid handles null supabase client', async () => {
      const result = await supabaseService.updateOrderStatusPaid({ orderId: 'ord_1' });
      expect(result).toEqual({ orderId: 'ord_1', status: 'paid' });
    });

    test('saveContactSubmission handles null supabase client', async () => {
      const result = await supabaseService.saveContactSubmission({ name: 'Test' });
      expect(result).toEqual({ success: true, simulated: true });
    });

    test('saveEnrollmentSubmission handles null supabase client', async () => {
      const result = await supabaseService.saveEnrollmentSubmission({ name: 'Test' });
      expect(result).toEqual({ success: true, simulated: true });
    });
  });
});
