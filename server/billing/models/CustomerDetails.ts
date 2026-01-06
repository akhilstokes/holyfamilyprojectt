// Customer Details Model for Billing Platform
// Based on design document specifications

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  taxId?: string;
  companyName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  paymentTerms?: number; // days
  creditLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validation functions
export const validateCustomerDetails = (customer: Partial<CustomerDetails>): string[] => {
  const errors: string[] = [];
  
  if (!customer.name) errors.push('Customer name is required');
  if (!customer.email) errors.push('Email is required');
  if (!customer.address) errors.push('Address is required');
  
  if (customer.email && !isValidEmail(customer.email)) {
    errors.push('Invalid email format');
  }
  
  if (customer.phone && !isValidPhone(customer.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return errors;
};

// Helper validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};