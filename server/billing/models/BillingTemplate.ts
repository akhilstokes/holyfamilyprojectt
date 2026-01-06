// Billing Template Model for Billing Platform
// Based on design document specifications

export enum TemplateType {
  SALARY = 'salary',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  STATEMENT = 'statement'
}

export interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface CalculationRule {
  field: string;
  formula: string;
  dependencies: string[];
  description: string;
}

export interface TemplateFormatting {
  headerColor: string;
  fontFamily: string;
  fontSize: number;
  logoUrl?: string;
  footerText?: string;
}

export interface BillingTemplate {
  id: string;
  name: string;
  type: TemplateType;
  fields: TemplateField[];
  calculationRules: CalculationRule[];
  formatting: TemplateFormatting;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

// Validation functions
export const validateBillingTemplate = (template: Partial<BillingTemplate>): string[] => {
  const errors: string[] = [];
  
  if (!template.name) errors.push('Template name is required');
  if (!template.type) errors.push('Template type is required');
  if (!template.fields || template.fields.length === 0) errors.push('At least one field is required');
  if (!template.createdBy) errors.push('Created by is required');
  
  if (template.fields) {
    template.fields.forEach((field, index) => {
      if (!field.name) errors.push(`Field ${index + 1}: Name is required`);
      if (!field.type) errors.push(`Field ${index + 1}: Type is required`);
    });
  }
  
  return errors;
};