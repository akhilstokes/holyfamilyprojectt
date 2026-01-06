// Salary Calculator Service for Billing Platform
// Based on design document specifications

import { StaffMember, SalaryStructure, PayslipData } from '../models';
import { calculateSalary, generatePayslipReference } from '../models/SalaryStructure';

export class SalaryCalculator {
  
  /**
   * Calculate salary for a staff member for a given period
   */
  calculateStaffSalary(staff: StaffMember, period: string): PayslipData {
    const salaryCalculation = calculateSalary(staff.salaryStructure);
    const referenceNumber = generatePayslipReference(staff.id, period);
    
    return {
      staffId: staff.id,
      period,
      basicSalary: staff.salaryStructure.basicSalary,
      allowances: staff.salaryStructure.allowances,
      deductions: staff.salaryStructure.deductions,
      grossSalary: salaryCalculation.grossSalary,
      totalDeductions: salaryCalculation.totalDeductions,
      netSalary: salaryCalculation.netSalary,
      referenceNumber,
      generatedAt: new Date()
    };
  }
  
  /**
   * Validate salary structure against predefined rules
   */
  validateSalaryStructure(salaryStructure: SalaryStructure): string[] {
    const errors: string[] = [];
    
    // Basic salary validation
    if (salaryStructure.basicSalary <= 0) {
      errors.push('Basic salary must be greater than 0');
    }
    
    // Allowances validation
    salaryStructure.allowances.forEach((allowance, index) => {
      if (allowance.amount < 0) {
        errors.push(`Allowance ${index + 1}: Amount cannot be negative`);
      }
      if (allowance.isPercentage && allowance.amount > 100) {
        errors.push(`Allowance ${index + 1}: Percentage cannot exceed 100%`);
      }
    });
    
    // Deductions validation
    salaryStructure.deductions.forEach((deduction, index) => {
      if (deduction.amount < 0) {
        errors.push(`Deduction ${index + 1}: Amount cannot be negative`);
      }
      if (deduction.isPercentage && deduction.amount > 100) {
        errors.push(`Deduction ${index + 1}: Percentage cannot exceed 100%`);
      }
    });
    
    // Net salary validation
    const calculation = calculateSalary(salaryStructure);
    if (calculation.netSalary < 0) {
      errors.push('Net salary cannot be negative - total deductions exceed gross salary');
    }
    
    return errors;
  }
  
  /**
   * Calculate salary for multiple staff members
   */
  calculateBulkSalaries(staffMembers: StaffMember[], period: string): PayslipData[] {
    return staffMembers
      .filter(staff => staff.isActive)
      .map(staff => this.calculateStaffSalary(staff, period));
  }
  
  /**
   * Generate itemized breakdown for payslip
   */
  generatePayslipBreakdown(payslip: PayslipData): {
    earnings: Array<{ description: string; amount: number }>;
    deductions: Array<{ description: string; amount: number }>;
    summary: { grossSalary: number; totalDeductions: number; netSalary: number };
  } {
    const earnings = [
      { description: 'Basic Salary', amount: payslip.basicSalary },
      ...payslip.allowances.map(allowance => ({
        description: allowance.type,
        amount: allowance.isPercentage 
          ? (payslip.basicSalary * allowance.amount / 100)
          : allowance.amount
      }))
    ];
    
    const deductions = payslip.deductions.map(deduction => ({
      description: deduction.type,
      amount: deduction.isPercentage 
        ? (payslip.grossSalary * deduction.amount / 100)
        : deduction.amount
    }));
    
    return {
      earnings,
      deductions,
      summary: {
        grossSalary: payslip.grossSalary,
        totalDeductions: payslip.totalDeductions,
        netSalary: payslip.netSalary
      }
    };
  }
}