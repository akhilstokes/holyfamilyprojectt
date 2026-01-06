// Billing Platform Data Models
// This file exports all the core data models for the billing platform

export * from './StaffMember';
export * from './PaymentTransaction';
export * from './BillingTemplate';
export * from './SalaryStructure';

// Export Invoice and CustomerDetails separately to avoid conflicts
export { Invoice, InvoiceItem, InvoiceStatus, validateInvoice, calculateInvoiceTotals } from './Invoice';
export { CustomerDetails, validateCustomerDetails } from './CustomerDetails';