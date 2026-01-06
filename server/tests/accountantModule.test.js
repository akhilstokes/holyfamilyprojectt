const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/userModel');
const Invoice = require('../models/invoiceModel');
const Salary = require('../models/salaryModel');

describe('Accountant Module Tests', () => {
  let accountantToken;
  let managerToken;
  let testStaff;
  let testInvoice;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await Invoice.deleteMany({});
    await Salary.deleteMany({});

    // Create test users
    const accountant = await User.create({
      name: 'Test Accountant',
      email: 'accountant@test.com',
      password: 'password123',
      role: 'accountant',
      status: 'active'
    });

    const manager = await User.create({
      name: 'Test Manager',
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager',
      status: 'active'
    });

    testStaff = await User.create({
      name: 'Test Staff',
      email: 'staff@test.com',
      password: 'password123',
      role: 'field_staff',
      status: 'active'
    });

    // Login to get tokens
    const accountantRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'accountant@test.com',
        password: 'password123'
      });

    accountantToken = accountantRes.body.token;

    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.com',
        password: 'password123'
      });

    managerToken = managerRes.body.token;
  });

  describe('Invoice Management', () => {
    test('Accountant should create invoice', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        vendor: 'Test Vendor',
        invoiceDate: '2024-01-01',
        dueDate: '2024-01-15',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
            taxRate: 18,
            taxAmount: 180
          }
        ],
        subtotal: 1000,
        taxAmount: 180,
        totalAmount: 1180
      };

      const res = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${accountantToken}`)
        .send(invoiceData)
        .expect(201);

      expect(res.body.message).toBe('Invoice created successfully');
      expect(res.body.data.invoiceNumber).toBe('INV-001');
      expect(res.body.data.status).toBe('pending');

      testInvoice = res.body.data;
    });

    test('Manager should approve invoice', async () => {
      // First create an invoice
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-002',
        vendor: 'Test Vendor',
        totalAmount: 1000,
        createdBy: testStaff._id
      });

      const res = await request(app)
        .put(`/api/invoices/${invoice._id}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.message).toBe('Invoice approved successfully');
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.approvedBy).toBeDefined();
    });

    test('Should record payment for invoice', async () => {
      // Create and approve invoice
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-003',
        vendor: 'Test Vendor',
        totalAmount: 1000,
        status: 'approved',
        createdBy: testStaff._id
      });

      const paymentData = {
        amount: 500,
        paymentMethod: 'bank_transfer',
        paymentReference: 'REF-001'
      };

      const res = await request(app)
        .post(`/api/invoices/${invoice._id}/payment`)
        .set('Authorization', `Bearer ${accountantToken}`)
        .send(paymentData)
        .expect(200);

      expect(res.body.message).toBe('Payment recorded successfully');
      expect(res.body.data.amountPaid).toBe(500);
      expect(res.body.data.status).toBe('partially_paid');
    });

    test('Should get invoices with filters', async () => {
      // Create test invoices
      await Invoice.create([
        {
          invoiceNumber: 'INV-004',
          vendor: 'Vendor A',
          totalAmount: 1000,
          status: 'pending',
          createdBy: testStaff._id
        },
        {
          invoiceNumber: 'INV-005',
          vendor: 'Vendor B',
          totalAmount: 2000,
          status: 'approved',
          createdBy: testStaff._id
        }
      ]);

      const res = await request(app)
        .get('/api/invoices?status=pending')
        .set('Authorization', `Bearer ${accountantToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('pending');
    });

    test('Should get financial summary', async () => {
      // Create test invoices
      await Invoice.create([
        {
          invoiceNumber: 'INV-006',
          vendor: 'Vendor A',
          totalAmount: 1000,
          amountPaid: 500,
          createdBy: testStaff._id
        },
        {
          invoiceNumber: 'INV-007',
          vendor: 'Vendor B',
          totalAmount: 2000,
          amountPaid: 2000,
          createdBy: testStaff._id
        }
      ]);

      const res = await request(app)
        .get('/api/invoices/financial/summary')
        .set('Authorization', `Bearer ${accountantToken}`)
        .expect(200);

      expect(res.body.data.invoices.totalInvoices).toBe(2);
      expect(res.body.data.invoices.totalAmount).toBe(3000);
      expect(res.body.data.invoices.paidAmount).toBe(2500);
    });
  });

  describe('Salary Management', () => {
    test('Should generate monthly salary', async () => {
      // Create salary template first
      const SalaryTemplate = require('../models/salaryTemplateModel');
      await SalaryTemplate.create({
        staff: testStaff._id,
        basicSalary: 10000,
        houseRentAllowance: 1000,
        medicalAllowance: 500,
        transportAllowance: 500,
        specialAllowance: 0,
        providentFundRate: 12,
        professionalTaxRate: 2,
        incomeTaxRate: 10,
        fixedDeductions: 0,
        isActive: true
      });

      const salaryData = {
        year: 2024,
        month: 1,
        bonus: 1000,
        overtime: 500
      };

      const res = await request(app)
        .post(`/api/salary/generate/${testStaff._id}`)
        .set('Authorization', `Bearer ${accountantToken}`)
        .send(salaryData)
        .expect(201);

      expect(res.body.message).toBe('Monthly salary generated successfully');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.netSalary).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    test('Should log invoice creation', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-008',
        vendor: 'Test Vendor',
        totalAmount: 1000
      };

      await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${accountantToken}`)
        .send(invoiceData)
        .expect(201);

      // Check audit log
      const AccountantAuditLog = require('../models/accountantAuditLogModel');
      const auditLog = await AccountantAuditLog.findOne({
        action: 'invoice_created'
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('invoice_created');
      expect(auditLog.actorRole).toBe('accountant');
    });
  });
});
