// Billing Platform Configuration
// Based on design document specifications

export interface BillingConfig {
  database: {
    connectionString: string;
    dbName: string;
  };
  paymentGateway: {
    razorpay: {
      keyId: string;
      keySecret: string;
      webhookSecret: string;
    };
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    templates: {
      payslipTemplate: string;
      invoiceTemplate: string;
      receiptTemplate: string;
    };
  };
  company: {
    name: string;
    logo: string;
    address: string;
    taxId: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  billing: {
    defaultCurrency: string;
    taxRates: {
      gst: number;
      tds: number;
    };
    invoiceNumberFormat: string;
    payslipNumberFormat: string;
  };
}

// Default configuration
export const defaultBillingConfig: BillingConfig = {
  database: {
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'holy_family_polymers'
  },
  paymentGateway: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
    }
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },
    templates: {
      payslipTemplate: 'payslip-template.html',
      invoiceTemplate: 'invoice-template.html',
      receiptTemplate: 'receipt-template.html'
    }
  },
  company: {
    name: 'Holy Family Polymers',
    logo: '/assets/logo.png',
    address: 'Holy Family Polymers Address',
    taxId: 'COMPANY_TAX_ID',
    colors: {
      primary: '#4A90E2',
      secondary: '#2ECC71',
      accent: '#2C3E50'
    }
  },
  billing: {
    defaultCurrency: 'INR',
    taxRates: {
      gst: 18,
      tds: 10
    },
    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{####}',
    payslipNumberFormat: 'PAY-{YYYY}-{MM}-{####}'
  }
}; 