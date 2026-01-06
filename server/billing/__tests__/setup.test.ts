// Billing Platform Setup Test
// **Feature: billing-platform, Property 1: Automated billing generation completeness**

import { BillingPlatform } from '../index';
import { SalaryCalculator } from '../services/SalaryCalculator';
import { StaffMember, SalaryStructure } from '../models';

describe('Billing Platform Setup', () => {
  let billingPlatform: BillingPlatform;
  
  beforeEach(() => {
    billingPlatform = new BillingPlatform();
  });
  
  test('should initialize billing platform successfully', async () => {
    await expect(billingPlatform.initialize()).resolves.not.toThrow();
  });
  
  test('should provide salary calculator instance', () => {
    const calculator = billingPlatform.getSalaryCalculator();
    expect(calculator).toBeInstanceOf(SalaryCalculator);
  });
  
  test('should provide billing repository instance', () => {
    const repository = billingPlatform.getBillingRepository();
    expect(repository).toBeDefined();
  });
  
  test('should have valid configuration', () => {
    const config = billingPlatform.getConfig();
    expect(config).toBeDefined();
    expect(config.company.name).toBe('Holy Family Polymers');
    expect(config.billing.defaultCurrency).toBe('INR');
  });
});

describe('Salary Calculator Basic Functionality', () => {
  let calculator: SalaryCalculator;
  
  beforeEach(() => {
    calculator = new SalaryCalculator();
  });
  
  test('should calculate salary correctly for basic structure', () => {
    const salaryStructure: SalaryStructure = {
      basicSalary: 50000,
      allowances: [
        { type: 'HRA', amount: 20, isPercentage: true },
        { type: 'Transport', amount: 2000, isPercentage: false }
      ],
      deductions: [
        { type: 'PF', amount: 12, isPercentage: true },
        { type: 'Insurance', amount: 1000, isPercentage: false }
      ],
      taxSettings: {
        taxBracket: '20%',
        exemptions: 0,
        additionalTax: 0
      }
    };
    
    const staffMember: StaffMember = {
      id: 'test-001',
      employeeId: 'EMP001',
      name: 'Test Employee',
      email: 'test@example.com',
      department: 'IT',
      position: 'Developer',
      salaryStructure,
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'Test Bank',
        ifscCode: 'TEST0001',
        accountHolderName: 'Test Employee'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const payslip = calculator.calculateStaffSalary(staffMember, '2024-01');
    
    expect(payslip.basicSalary).toBe(50000);
    expect(payslip.grossSalary).toBe(62000); // 50000 + (50000 * 0.2) + 2000
    expect(payslip.netSalary).toBe(53560); // 62000 - (62000 * 0.12) - 1000
    expect(payslip.referenceNumber).toContain('PAY-test-001');
  });
  
  test('should validate salary structure correctly', () => {
    const invalidStructure: SalaryStructure = {
      basicSalary: -1000, // Invalid: negative
      allowances: [
        { type: 'HRA', amount: 150, isPercentage: true } // Invalid: > 100%
      ],
      deductions: [
        { type: 'PF', amount: -5, isPercentage: true } // Invalid: negative
      ],
      taxSettings: {
        taxBracket: '20%',
        exemptions: 0,
        additionalTax: 0
      }
    };
    
    const errors = calculator.validateSalaryStructure(invalidStructure);
    
    expect(errors).toContain('Basic salary must be greater than 0');
    expect(errors).toContain('Allowance 1: Percentage cannot exceed 100%');
    expect(errors).toContain('Deduction 1: Amount cannot be negative');
  });
});