// Payroll System Integration Interface
// Based on design document specifications

import { StaffMember } from '../models';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalaryRates {
  basicSalary: number;
  allowances: Array<{ type: string; amount: number; isPercentage: boolean }>;
  deductions: Array<{ type: string; amount: number; isPercentage: boolean }>;
}

export interface PayrollRecord {
  staffId: string;
  period: string;
  grossSalary: number;
  netSalary: number;
  paymentDate: Date;
  status: 'pending' | 'processed' | 'paid';
}

// DateRange is now exported from the main interfaces index

export interface PayrollIntegration {
  /**
   * Synchronize staff data from external payroll system
   */
  syncStaffData(): Promise<StaffMember[]>;
  
  /**
   * Update salary rates for a specific staff member
   */
  updateSalaryRates(staffId: string, rates: SalaryRates): Promise<void>;
  
  /**
   * Get payroll history for a staff member within a date range
   */
  getPayrollHistory(staffId: string, period: DateRange): Promise<PayrollRecord[]>;
  
  /**
   * Push calculated payroll data to external system
   */
  pushPayrollData(payrollRecords: PayrollRecord[]): Promise<void>;
  
  /**
   * Verify data consistency between systems
   */
  verifyDataConsistency(staffId: string, period: string): Promise<boolean>;
}