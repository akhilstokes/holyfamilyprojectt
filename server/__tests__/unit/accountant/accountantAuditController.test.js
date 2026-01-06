const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const AccountantAuditLog = require('../../../models/accountantAuditLogModel');
const User = require('../../../models/userModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the audit service
jest.mock('../../../services/auditService', () => ({
  getAuditLogs: jest.fn()
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
const accountantAuditController = require('../../../controllers/accountantAuditController');
app.get('/api/accountant-audit/audit-logs', mockAuth, accountantAuditController.getAuditLogs);
app.get('/api/accountant-audit/audit-logs/:auditId', mockAuth, accountantAuditController.getAuditLog);
app.get('/api/accountant-audit/audit-logs/summary', mockAuth, accountantAuditController.getAuditSummary);

describe('Accountant Audit Controller', () => {
  let mongoServer;
  let auditLogId;
  let userId;

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
    await AccountantAuditLog.deleteMany({});
    await User.deleteMany({});
    
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      role: 'accountant',
      password: 'password123'
    });
    
    userId = user._id;
    
    // Create a test audit log
    const auditLog = await AccountantAuditLog.create({
      action: 'salary_generated',
      actor: userId,
      actorRole: 'accountant',
      target: 'test-target-id',
      targetType: 'salary',
      description: 'Test audit log entry',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });
    
    auditLogId = auditLog._id;
  });

  describe('getAuditLogs', () => {
    it('should get audit logs', async () => {
      // Mock the service response
      const mockGetAuditLogs = require('../../../services/auditService').getAuditLogs;
      mockGetAuditLogs.mockResolvedValue({
        logs: [{
          _id: auditLogId,
          action: 'salary_generated',
          actor: userId,
          actorRole: 'accountant',
          target: 'test-target-id',
          targetType: 'salary',
          description: 'Test audit log entry'
        }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1
        }
      });

      const response = await request(app)
        .get('/api/accountant-audit/audit-logs')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].action).toBe('salary_generated');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter audit logs by action', async () => {
      const mockGetAuditLogs = require('../../../services/auditService').getAuditLogs;
      mockGetAuditLogs.mockResolvedValue({
        logs: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      });

      const response = await request(app)
        .get('/api/accountant-audit/audit-logs?action=salary_paid')
        .expect(200);

      expect(mockGetAuditLogs).toHaveBeenCalledWith(
        { action: 'salary_paid' },
        { page: 1, limit: 50, sort: { timestamp: -1 } }
      );
    });
  });

  describe('getAuditLog', () => {
    it('should get a specific audit log', async () => {
      const response = await request(app)
        .get(`/api/accountant-audit/audit-logs/${auditLogId}`)
        .expect(200);

      expect(response.body.data.action).toBe('salary_generated');
      expect(response.body.data.description).toBe('Test audit log entry');
    });

    it('should return 404 if audit log is not found', async () => {
      const fakeAuditId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/accountant-audit/audit-logs/${fakeAuditId}`)
        .expect(404);

      expect(response.body.message).toBe('Audit log not found');
    });
  });

  describe('getAuditSummary', () => {
    beforeEach(async () => {
      // Create additional audit logs for summary testing
      await AccountantAuditLog.create([
        {
          action: 'salary_approved',
          actor: userId,
          actorRole: 'manager',
          target: 'test-target-id-2',
          targetType: 'salary',
          description: 'Test audit log entry 2',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        },
        {
          action: 'salary_generated',
          actor: userId,
          actorRole: 'accountant',
          target: 'test-target-id-3',
          targetType: 'salary',
          description: 'Test audit log entry 3',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      ]);
    });

    it('should get audit summary', async () => {
      const response = await request(app)
        .get('/api/accountant-audit/audit-logs/summary')
        .expect(200);

      expect(response.body.data.actionSummary).toBeDefined();
      expect(response.body.data.actorSummary).toBeDefined();
    });

    it('should filter audit summary by date range', async () => {
      const response = await request(app)
        .get('/api/accountant-audit/audit-logs/summary?startDate=2024-01-01&endDate=2024-12-31')
        .expect(200);

      expect(response.body.data.period).toBe('2024-01-01 to 2024-12-31');
    });
  });
});