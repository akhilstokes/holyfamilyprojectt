// Staff Member Model for Billing Platform
// Based on design document specifications

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface Allowance {
  type: string;
  amount: number;
  isPercentage: boolean;
  description?: string;
}

export interface Deduction {
  type: string;
  amount: number;
  isPercentage: boolean;
  description?: string;
}

export interface TaxSettings {
  taxBracket: string;
  exemptions: number;
  additionalTax: number;
}

export interface SalaryStructure {
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  taxSettings: TaxSettings;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salaryStructure: SalaryStructure;
  bankDetails: BankDetails;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
export const validateStaffMember = (staff: Partial<StaffMember>): string[] => {
  const errors: string[] = [];
  
  if (!staff.employeeId) errors.push('Employee ID is required');
  if (!staff.name) errors.push('Name is required');
  if (!staff.email) errors.push('Email is required');
  if (!staff.department) errors.push('Department is required');
  if (!staff.position) errors.push('Position is required');
  
  if (staff.salaryStructure) {
    if (!staff.salaryStructure.basicSalary || staff.salaryStructure.basicSalary <= 0) {
      errors.push('Basic salary must be greater than 0');
    }
  }
  
  return errors;
};