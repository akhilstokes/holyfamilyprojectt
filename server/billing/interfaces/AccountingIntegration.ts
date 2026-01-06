// Accounting System Integration Interface
// Based on design document specifications

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  accountCode: string;
  description: string;
  reference: string;
  date: Date;
  metadata?: any;
}

export interface AccountEntry {
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccount?: string;
  isActive: boolean;
}

export interface ReconciliationReport {
  period: string;
  totalTransactions: number;
  reconciledTransactions: number;
  unreconciledTransactions: number;
  discrepancies: Array<{
    transactionId: string;
    expectedAmount: number;
    actualAmount: number;
    difference: number;
  }>;
}

// DateRange is now exported from the main interfaces index

export interface AccountingIntegration {
  /**
   * Post a transaction to the accounting system
   */
  postTransaction(transaction: Transaction): Promise<string>;
  
  /**
   * Reconcile payments for a specific period
   */
  reconcilePayments(period: DateRange): Promise<ReconciliationReport>;
  
  /**
   * Update chart of accounts
   */
  updateChartOfAccounts(account: AccountEntry): Promise<void>;
  
  /**
   * Get account balance for a specific account
   */
  getAccountBalance(accountCode: string, asOfDate?: Date): Promise<number>;
  
  /**
   * Generate journal entries for billing transactions
   */
  generateJournalEntries(transactions: Transaction[]): Promise<void>;
  
  /**
   * Verify transaction integrity
   */
  verifyTransactionIntegrity(transactionId: string): Promise<boolean>;
}