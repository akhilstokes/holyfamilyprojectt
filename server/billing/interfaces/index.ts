// Billing Platform External Interfaces
// This file exports all the external integration interfaces

export * from './PaymentGateway';

// Export specific interfaces to avoid DateRange conflicts
export { PayrollIntegration, SalaryRates, PayrollRecord } from './PayrollIntegration';
export { AccountingIntegration, Transaction, AccountEntry, ReconciliationReport } from './AccountingIntegration';

// Common DateRange interface
export interface DateRange {
  startDate: Date;
  endDate: Date;
}