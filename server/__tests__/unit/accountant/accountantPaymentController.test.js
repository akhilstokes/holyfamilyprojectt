const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const AccountantPayment = require('../../../models/accountantPaymentModel');
const Invoice = require('../../../models/invoiceModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the audit service
jest.mock('../../../services/auditService', () => ({
  logAudit: jest.fn()
}));

// Create express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = {
    _id: 'test-user-id',
    role: 'accountant'
  };
  next();
};

// Import and use the controller
const accountantPaymentController = require('../../../controllers/accountantPaymentController');
app.post('/api/accountant-payments/invoices/:invoiceId/payments', mockAuth, accountantPaymentController.recordPayment);
app.get('/api/accountant-payments/payments', mockAuth, accountantPaymentController.getPayments);
app.get('/api/accountant-payments/payments/:paymentId', mockAuth, accountantPaymentController.getPayment);
app.put('/api/accountant-payments/payments/:paymentId/reconcile', mockAuth, accountantPaymentController.reconcilePayment);

describe('Accountant Payment Controller', () => {
  let mongoServer;
  let invoiceId;
  let paymentId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections
    await AccountantPayment.deleteMany({});
    await Invoice.deleteMany({});
    
    // Create a test invoice
    const invoice = await Invoice.create({
      invoiceNumber: 'INV001',
      vendor: 'Test Vendor',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 10000,
      taxAmount: 1800,
      totalAmount: 11800,
      createdBy: 'test-user-id'
    });
    
    invoiceId = invoice._id;
  });

  describe('recordPayment', () => {
    it('should record a payment for an invoice', async () => {
      const response = await request(app)
        .post(`/api/accountant-payments/invoices/${invoiceId}/payments`)
        .send({
          amount: 5000,
          paymentMethod: 'bank_transfer',
          paymentReference: 'TXN123456',
          paymentDate: new Date()
        })
        .expect(201);

      expect(response.body.message).toBe('Payment recorded successfully');
      expect(response.body.data.payment.amount).toBe(5000);
      expect(response.body.data.payment.paymentMethod).toBe('bank_transfer');
      
      // Check that payment ID is stored for later tests
      paymentId = response.body.data.payment._id;
    });

    it('should return 400 if amount or payment method is missing', async () => {
      const response = await request(app)
        .post(`/api/accountant-payments/invoices/${invoiceId}/payments`)
        .send({
          amount: 5000
          // Missing paymentMethod
        })
        .expect(400);

      expect(response.body.message).toBe('Amount and payment method are required');
    });

    it('should return 404 if invoice is not found', async () => {
      const fakeInvoiceId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/accountant-payments/invoices/${fakeInvoiceId}/payments`)
        .send({
          amount: 5000,
          paymentMethod: 'bank_transfer'
        })
        .expect(404);

      expect(response.body.message).toBe('Invoice not found');
    });
  });

  describe('getPayment', () => {
    beforeEach(async () => {
      // Create a payment for testing
      const payment = await AccountantPayment.create({
        invoiceId: invoiceId,
        amount: 5000,
        paymentMethod: 'bank_transfer',
        paymentReference: 'TXN123456',
        paymentDate: new Date(),
        createdBy: 'test-user-id'
      });
      
      paymentId = payment._id;
    });

    it('should get payment details', async () => {
      const response = await request(app)
        .get(`/api/accountant-payments/payments/${paymentId}`)
        .expect(200);

      expect(response.body.data.amount).toBe(5000);
      expect(response.body.data.paymentMethod).toBe('bank_transfer');
    });

    it('should return 404 if payment is not found', async () => {
      const fakePaymentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/accountant-payments/payments/${fakePaymentId}`)
        .expect(404);

      expect(response.body.message).toBe('Payment not found');
    });
  });

  describe('getPayments', () => {
    beforeEach(async () => {
      // Create multiple payments for testing
      await AccountantPayment.create([
        {
          invoiceId: invoiceId,
          amount: 5000,
          paymentMethod: 'bank_transfer',
          paymentDate: new Date(),
          createdBy: 'test-user-id'
        },
        {
          invoiceId: invoiceId,
          amount: 3000,
          paymentMethod: 'cheque',
          paymentDate: new Date(),
          createdBy: 'test-user-id'
        }
      ]);
    });

    it('should get all payments', async () => {
      const response = await request(app)
        .get('/api/accountant-payments/payments')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].amount).toBe(5000);
      expect(response.body.data[1].amount).toBe(3000);
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/accountant-payments/payments?status=completed')
        .expect(200);

      // All payments should have status 'completed' by default
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('reconcilePayment', () => {
    beforeEach(async () => {
      // Create a payment for testing
      const payment = await AccountantPayment.create({
        invoiceId: invoiceId,
        amount: 5000,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date(),
        createdBy: 'test-user-id'
      });
      
      paymentId = payment._id;
    });

    it('should reconcile a payment', async () => {
      const response = await request(app)
        .put(`/api/accountant-payments/payments/${paymentId}/reconcile`)
        .expect(200);

      expect(response.body.message).toBe('Payment reconciled successfully');
      expect(response.body.data.reconciled).toBe(true);
      expect(response.body.data.reconciledBy).toBe('test-user-id');
    });

    it('should return 404 if payment is not found', async () => {
      const fakePaymentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/accountant-payments/payments/${fakePaymentId}/reconcile`)
        .expect(404);

      expect(response.body.message).toBe('Payment not found');
    });

    it('should return 400 if payment is already reconciled', async () => {
      // First reconciliation
      await request(app)
        .put(`/api/accountant-payments/payments/${paymentId}/reconcile`)
        .expect(200);

      // Second reconciliation should fail
      const response = await request(app)
        .put(`/api/accountant-payments/payments/${paymentId}/reconcile`)
        .expect(400);

      expect(response.body.message).toBe('Payment already reconciled');
    });
  });
});