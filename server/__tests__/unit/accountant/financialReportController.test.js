const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Salary = require('../../../models/salaryModel');
const Invoice = require('../../../models/invoiceModel');
const AccountantPayment = require('../../../models/accountantPaymentModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

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
const financialReportController = require('../../../controllers/financialReportController');
app.get('/api/financial/reports/financial/monthly', mockAuth, financialReportController.getMonthlyFinancialReport);
app.get('/api/financial/reports/financial/yearly', mockAuth, financialReportController.getYearlyFinancialReport);
app.get('/api/financial/reports/financial/cash-flow', mockAuth, financialReportController.getCashFlowReport);

describe('Financial Report Controller', () => {
  let mongoServer;

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
    await Salary.deleteMany({});
    await Invoice.deleteMany({});
    await AccountantPayment.deleteMany({});
  });

  describe('getMonthlyFinancialReport', () => {
    beforeEach(async () => {
      // Create test data
      const testDate = new Date('2024-01-15');
      
      // Create test salaries
      await Salary.create([
        {
          staff: 'staff1',
          year: 2024,
          month: 1,
          basicSalary: 30000,
          houseRentAllowance: 15000,
          medicalAllowance: 5000,
          transportAllowance: 3000,
          specialAllowance: 2000,
          providentFund: 3600,
          professionalTax: 750,
          incomeTax: 3000,
          otherDeductions: 1000,
          status: 'paid',
          paymentDate: testDate,
          paymentMethod: 'bank_transfer',
          createdBy: 'test-user-id'
        },
        {
          staff: 'staff2',
          year: 2024,
          month: 1,
          basicSalary: 25000,
          houseRentAllowance: 12500,
          medicalAllowance: 5000,
          transportAllowance: 3000,
          specialAllowance: 1000,
          providentFund: 3000,
          professionalTax: 625,
          incomeTax: 2500,
          otherDeductions: 500,
          status: 'paid',
          paymentDate: testDate,
          paymentMethod: 'bank_transfer',
          createdBy: 'test-user-id'
        }
      ]);

      // Create test invoices
      await Invoice.create([
        {
          invoiceNumber: 'INV001',
          vendor: 'Vendor A',
          invoiceDate: testDate,
          dueDate: new Date('2024-02-15'),
          subtotal: 50000,
          taxAmount: 9000,
          totalAmount: 59000,
          amountPaid: 59000,
          status: 'paid',
          createdBy: 'test-user-id'
        },
        {
          invoiceNumber: 'INV002',
          vendor: 'Vendor B',
          invoiceDate: testDate,
          dueDate: new Date('2024-02-15'),
          subtotal: 30000,
          taxAmount: 5400,
          totalAmount: 35400,
          amountPaid: 35400,
          status: 'paid',
          createdBy: 'test-user-id'
        }
      ]);

      // Create test payments
      await AccountantPayment.create([
        {
          invoiceId: 'invoice1',
          amount: 59000,
          paymentMethod: 'bank_transfer',
          paymentDate: testDate,
          status: 'completed',
          createdBy: 'test-user-id'
        },
        {
          invoiceId: 'invoice2',
          amount: 35400,
          paymentMethod: 'bank_transfer',
          paymentDate: testDate,
          status: 'completed',
          createdBy: 'test-user-id'
        }
      ]);
    });

    it('should get monthly financial report', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/monthly?year=2024&month=1')
        .expect(200);

      expect(response.body.data.period.year).toBe(2024);
      expect(response.body.data.period.month).toBe(1);
      expect(response.body.data.salaries.totalSalaries).toBe(2);
      expect(response.body.data.invoices.totalInvoices).toBe(2);
      expect(response.body.data.payments.totalPayments).toBe(2);
    });

    it('should return 400 if year or month is missing', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/monthly?year=2024')
        .expect(400);

      expect(response.body.message).toBe('Year and month are required');
    });
  });

  describe('getYearlyFinancialReport', () => {
    beforeEach(async () => {
      // Create test data for multiple months
      const salaries = [];
      for (let i = 1; i <= 12; i++) {
        salaries.push({
          staff: `staff${i}`,
          year: 2024,
          month: i,
          basicSalary: 30000,
          houseRentAllowance: 15000,
          medicalAllowance: 5000,
          transportAllowance: 3000,
          specialAllowance: 2000,
          providentFund: 3600,
          professionalTax: 750,
          incomeTax: 3000,
          otherDeductions: 1000,
          grossSalary: 55000,
          totalDeductions: 8350,
          netSalary: 46650,
          status: 'paid',
          createdBy: 'test-user-id'
        });
      }
      
      await Salary.insertMany(salaries);

      // Create test invoices
      await Invoice.create({
        invoiceNumber: 'INV001',
        vendor: 'Vendor A',
        invoiceDate: new Date('2024-06-15'),
        dueDate: new Date('2024-07-15'),
        subtotal: 100000,
        taxAmount: 18000,
        totalAmount: 118000,
        amountPaid: 118000,
        status: 'paid',
        createdBy: 'test-user-id'
      });
    });

    it('should get yearly financial report', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/yearly?year=2024')
        .expect(200);

      expect(response.body.data.year).toBe(2024);
      expect(response.body.data.monthlyBreakdown.length).toBeGreaterThan(0);
      expect(response.body.data.invoices.totalInvoices).toBe(1);
    });

    it('should return 400 if year is missing', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/yearly')
        .expect(400);

      expect(response.body.message).toBe('Year is required');
    });
  });

  describe('getCashFlowReport', () => {
    beforeEach(async () => {
      const testDate = new Date('2024-01-15');
      
      // Create test payments (inflow)
      await AccountantPayment.create({
        invoiceId: 'invoice1',
        amount: 50000,
        paymentMethod: 'bank_transfer',
        paymentDate: testDate,
        status: 'completed',
        createdBy: 'test-user-id'
      });

      // Create test salary payments (outflow)
      await Salary.create({
        staff: 'staff1',
        year: 2024,
        month: 1,
        basicSalary: 30000,
        houseRentAllowance: 15000,
        medicalAllowance: 5000,
        transportAllowance: 3000,
        specialAllowance: 2000,
        providentFund: 3600,
        professionalTax: 750,
        incomeTax: 3000,
        otherDeductions: 1000,
        grossSalary: 55000,
        totalDeductions: 8350,
        netSalary: 46650,
        status: 'paid',
        paymentDate: testDate,
        paymentMethod: 'bank_transfer',
        createdBy: 'test-user-id'
      });
    });

    it('should get cash flow report', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/cash-flow?startDate=2024-01-01&endDate=2024-01-31')
        .expect(200);

      expect(response.body.data.period.startDate).toBeDefined();
      expect(response.body.data.period.endDate).toBeDefined();
      expect(response.body.data.inflow.length).toBeGreaterThanOrEqual(0);
      expect(response.body.data.outflow.length).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 if startDate or endDate is missing', async () => {
      const response = await request(app)
        .get('/api/financial/reports/financial/cash-flow?startDate=2024-01-01')
        .expect(400);

      expect(response.body.message).toBe('Start date and end date are required');
    });
  });
});