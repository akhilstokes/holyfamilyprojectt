// Invoice Model for Billing Platform
// Based on design document specifications

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  taxId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerDetails: CustomerDetails;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
}

// Validation functions
export const validateInvoice = (invoice: Partial<Invoice>): string[] => {
  const errors: string[] = [];
  
  if (!invoice.invoiceNumber) errors.push('Invoice number is required');
  if (!invoice.customerId) errors.push('Customer ID is required');
  if (!invoice.items || invoice.items.length === 0) errors.push('At least one item is required');
  if (!invoice.dueDate) errors.push('Due date is required');
  
  if (invoice.items) {
    invoice.items.forEach((item, index) => {
      if (!item.description) errors.push(`Item ${index + 1}: Description is required`);
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      if (item.unitPrice <= 0) errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
    });
  }
  
  return errors;
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items: InvoiceItem[]): { subtotal: number; taxAmount: number; totalAmount: number } => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const totalAmount = subtotal + taxAmount;
  
  return { subtotal, taxAmount, totalAmount };
};