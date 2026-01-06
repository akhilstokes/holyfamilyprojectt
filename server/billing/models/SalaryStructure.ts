// Additional Salary Structure utilities
// Based on design document specifications

import { SalaryStructure, Allowance, Deduction } from './StaffMember';

export interface PayslipData {
  staffId: string;
  period: string;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  referenceNumber: string;
  generatedAt: Date;
}

// Calculate salary components
export const calculateSalary = (salaryStructure: SalaryStructure): {
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
} => {
  const { basicSalary, allowances, deductions } = salaryStructure;
  
  const totalAllowances = allowances.reduce((sum, allowance) => {
    if (allowance.isPercentage) {
      return sum + (basicSalary * allowance.amount / 100);
    }
    return sum + allowance.amount;
  }, 0);
  
  const grossSalary = basicSalary + totalAllowances;
  
  const totalDeductions = deductions.reduce((sum, deduction) => {
    if (deduction.isPercentage) {
      return sum + (grossSalary * deduction.amount / 100);
    }
    return sum + deduction.amount;
  }, 0);
  
  const netSalary = grossSalary - totalDeductions;
  
  return {
    grossSalary,
    totalAllowances,
    totalDeductions,
    netSalary
  };
};

// Generate unique reference number for payslips
export const generatePayslipReference = (staffId: string, period: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${staffId}-${period.replace(/[^0-9]/g, '')}-${timestamp}-${random}`;
};