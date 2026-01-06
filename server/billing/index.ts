// Billing Platform Main Entry Point
// Based on design document specifications

// Export all models
export * from './models';

// Export all services
export * from './services';

// Export all repositories
export * from './repositories';

// Export all interfaces
export * from './interfaces';

// Export configuration
export * from './config';

// Main Billing Platform class
import { BillingConfig, defaultBillingConfig } from './config';
import { SalaryCalculator } from './services/SalaryCalculator';
import { MongoBillingRepository } from './repositories/BillingRepository';

export class BillingPlatform {
  private config: BillingConfig;
  private salaryCalculator: SalaryCalculator;
  private billingRepository: MongoBillingRepository;
  
  constructor(config?: Partial<BillingConfig>) {
    this.config = { ...defaultBillingConfig, ...config };
    this.salaryCalculator = new SalaryCalculator();
    this.billingRepository = new MongoBillingRepository();
  }
  
  /**
   * Initialize the billing platform
   */
  async initialize(): Promise<void> {
    console.log('Initializing Billing Platform...');
    // Database connection and other initialization logic will be added
    console.log('Billing Platform initialized successfully');
  }
  
  /**
   * Get salary calculator instance
   */
  getSalaryCalculator(): SalaryCalculator {
    return this.salaryCalculator;
  }
  
  /**
   * Get billing repository instance
   */
  getBillingRepository(): MongoBillingRepository {
    return this.billingRepository;
  }
  
  /**
   * Get current configuration
   */
  getConfig(): BillingConfig {
    return this.config;
  }
}