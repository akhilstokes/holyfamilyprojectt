// Payment Transaction Model for Billing Platform
// Based on design document specifications

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NET_BANKING = 'net_banking',
  UPI = 'upi',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface GatewayResponse {
  gatewayTransactionId: string;
  gatewayName: string;
  responseCode: string;
  responseMessage: string;
  rawResponse: any;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  invoiceId?: string;
  payrollId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  gatewayResponse: GatewayResponse;
  status: TransactionStatus;
  processedAt: Date;
  reconciled: boolean;
}

// Validation functions
export const validatePaymentTransaction = (transaction: Partial<PaymentTransaction>): string[] => {
  const errors: string[] = [];
  
  if (!transaction.transactionId) errors.push('Transaction ID is required');
  if (!transaction.amount || transaction.amount <= 0) errors.push('Amount must be greater than 0');
  if (!transaction.currency) errors.push('Currency is required');
  if (!transaction.paymentMethod) errors.push('Payment method is required');
  
  return errors;
};