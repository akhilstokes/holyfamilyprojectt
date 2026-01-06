// Payment Gateway Integration Interface
// Based on design document specifications

import { PaymentMethod, TransactionStatus } from '../models/PaymentTransaction';

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customerDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  orderDetails: {
    orderId: string;
    description: string;
    items?: Array<{
      name: string;
      amount: number;
      quantity: number;
    }>;
  };
  callbackUrl?: string;
  metadata?: any;
}

export interface PaymentResponse {
  transactionId: string;
  gatewayTransactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
  metadata?: any;
}

export interface PaymentStatus {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
  failureReason?: string;
  gatewayFee?: number;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // Partial refund if specified
  reason: string;
  metadata?: any;
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  processedAt: Date;
  estimatedSettlement?: Date;
}

export interface PaymentGateway {
  /**
   * Process a payment request
   */
  processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse>;
  
  /**
   * Verify payment status
   */
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
  
  /**
   * Refund a payment
   */
  refundPayment(refundRequest: RefundRequest): Promise<RefundResponse>;
  
  /**
   * Get payment details
   */
  getPaymentDetails(transactionId: string): Promise<PaymentResponse>;
  
  /**
   * Handle webhook notifications from gateway
   */
  handleWebhook(payload: any, signature: string): Promise<PaymentStatus>;
  
  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): Promise<PaymentMethod[]>;
}