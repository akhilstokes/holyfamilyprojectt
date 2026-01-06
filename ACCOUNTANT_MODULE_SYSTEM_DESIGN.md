# 🏦 Accountant Module – System Design & Implementation Guide

## 📋 Table of Contents
1. [Module Overview](#module-overview)
2. [Core Responsibilities](#core-responsibilities)
3. [System Architecture](#system-architecture)
4. [Data Models](#data-models)
5. [Process Workflows](#process-workflows)
6. [API Endpoints](#api-endpoints)
7. [Role-Based Access Control](#role-based-access-control)
8. [Financial Reports & Analytics](#financial-reports--analytics)
9. [Audit & Compliance](#audit--compliance)
10. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Module Overview

The **Accountant Module** is the financial backbone of Holy Family Polymers, ensuring:
- ✅ Accurate transaction tracking
- ✅ Transparent payroll processing
- ✅ Compliance with financial policies
- ✅ Real-time financial visibility
- ✅ Audit-ready documentation

### Key Stakeholders
| Role | Responsibility |
|------|-----------------|
| **Accountant** | Generate payroll, track payments, create reports |
| **Manager** | Approve salaries, authorize payments |
| **Admin** | Override, audit, system configuration |
| **Staff** | View salary details, download payslips |

---

## 🔑 Core Responsibilities

### 1. **Invoice Management**
```
INPUT: Invoice from vendor/supplier
  ↓
PROCESS: 
  - Verify invoice details (amount, items, dates)
  - Check against purchase orders
  - Validate tax calculations
  - Check budget allocation
  ↓
OUTPUT: 
  - Approved/Rejected status
  - Payment schedule
  - Audit trail
```

**Key Actions:**
- Review invoice authenticity
- Verify line items and quantities
- Check tax compliance (GST, TDS)
- Match with PO (Purchase Order)
- Flag discrepancies for resolution

---

### 2. **Payment Tracking**
```
INPUT: Approved invoices & bills
  ↓
PROCESS:
  - Match payments with bills
  - Track payment status (pending, partial, full)
  - Record payment method & reference
  - Update payment dates
  ↓
OUTPUT:
  - Payment records
  - Bill status updates
  - Payment history
```

**Payment Status Flow:**
```
PENDING → PARTIAL → FULLY PAID
   ↓        ↓          ↓
Awaiting  Partial    Complete
Payment   Payment    Payment
```

---

### 3. **Payroll Processing**
```
INPUT: 
  - Attendance records
  - Overtime hours
  - Salary templates
  - Deductions & allowances
  ↓
PROCESS:
  1. Calculate gross salary
  2. Apply allowances
  3. Deduct taxes & benefits
  4. Calculate net salary
  5. Generate payslip
  6. Create audit entry
  ↓
OUTPUT:
  - Salary record (pending approval)
  - Payslip (HTML/PDF)
  - Payroll entry log
  - Staff notification
```

**Payroll Calculation Formula:**
```
GROSS SALARY = Basic + HRA + Medical + Transport + Special Allowances

DEDUCTIONS = Income Tax + PF + ESI + Other Deductions

NET SALARY = GROSS SALARY - DEDUCTIONS
```

---

## 🏗️ System Architecture

### Component Diagram
```
┌─────────────────────────────────────────────────────────┐
│                   ACCOUNTANT MODULE                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Invoice    │  │   Payment    │  │   Payroll    │  │
│  │  Management  │  │   Tracking   │  │  Processing  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                  │           │
│         └─────────────────┼──────────────────┘           │
│                           │                              │
│                    ┌──────▼──────┐                       │
│                    │  Database   │                       │
│                    │   Models    │                       │
│                    └─────────────┘                       │
│                           │                              │
│         ┌─────────────────┼─────────────────┐            │
│         │                 │                 │            │
│    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐       │
│    │ Reports │      │  Audit   │      │ Notify  │       │
│    │ & Stats │      │  Logs    │      │ Staff   │       │
│    └─────────┘      └──────────┘      └─────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models

### 1. **Salary Model**
```javascript
{
  staff: ObjectId,              // Reference to User
  year: Number,                 // 2024
  month: Number,                // 1-12
  
  // Income Components
  basicSalary: Number,
  houseRentAllowance: Number,
  medicalAllowance: Number,
  transportAllowance: Number,
  specialAllowance: Number,
  overtimeHours: Number,
  overtimeRate: Number,
  
  // Deductions
  incomeTax: Number,
  providentFund: Number,
  employeeStateInsurance: Number,
  otherDeductions: Number,
  
  // Calculated Fields
  grossSalary: Number,
  totalDeductions: Number,
  netSalary: Number,
  
  // Status & Tracking
  status: 'pending' | 'approved' | 'paid',
  approvedBy: ObjectId,
  approvedDate: Date,
  paymentDate: Date,
  paymentMethod: String,
  paymentReference: String,
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId
}
```

### 2. **PayrollEntry Model**
```javascript
{
  staff: ObjectId,              // Reference to User
  year: Number,
  month: Number,
  
  type: 'received' | 'advance' | 'deduction' | 'bonus',
  amount: Number,
  note: String,
  
  createdBy: ObjectId,
  createdAt: Date
}
```

### 3. **Invoice Model** (Proposed)
```javascript
{
  invoiceNumber: String,        // Unique invoice ID
  vendor: String,               // Vendor/Supplier name
  invoiceDate: Date,
  dueDate: Date,
  
  // Line Items
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
    taxRate: Number,
    taxAmount: Number
  }],
  
  // Totals
  subtotal: Number,
  taxAmount: Number,
  totalAmount: Number,
  
  // Status
  status: 'pending' | 'approved' | 'partially_paid' | 'paid',
  
  // Payment Tracking
  amountPaid: Number,
  paymentHistory: [{
    date: Date,
    amount: Number,
    method: String,
    reference: String
  }],
  
  // Approval
  approvedBy: ObjectId,
  approvedDate: Date,
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **SalarySummary Model**
```javascript
{
  staff: ObjectId,
  year: Number,
  month: Number,
  
  // Totals
  grossSalary: Number,
  receivedAmount: Number,
  advanceAmount: Number,
  bonusAmount: Number,
  deductionAmount: Number,
  pendingAmount: Number,
  
  // Status
  status: 'pending' | 'partial' | 'complete',
  
  lastUpdated: Date
}
```

---

## 🔄 Process Workflows

### **Workflow 1: Monthly Payroll Generation & Payment**

```
START
  │
  ├─→ [1] ATTENDANCE COLLECTION
  │   - Collect attendance for month
  │   - Calculate working days
  │   - Identify absences & leaves
  │
  ├─→ [2] SALARY GENERATION (Accountant)
  │   - Fetch salary template
  │   - Calculate gross salary
  │   - Apply deductions
  │   - Generate payslip
  │   - Status: PENDING
  │
  ├─→ [3] APPROVAL (Manager/Admin)
  │   - Review salary details
  │   - Verify calculations
  │   - Approve or request changes
  │   - Status: APPROVED
  │
  ├─→ [4] PAYMENT PROCESSING (Accountant)
  │   - Select payment method
  │   - Record payment reference
  │   - Update payment date
  │   - Status: PAID
  │
  ├─→ [5] NOTIFICATION
  │   - Send email to staff
  │   - Create in-app notification
  │   - Log payroll entry
  │
  └─→ END
```

**Timeline:**
- **Day 1-25:** Attendance collection
- **Day 26:** Salary generation
- **Day 27:** Manager approval
- **Day 28-30:** Payment processing
- **Day 30:** Staff notification

---

### **Workflow 2: Invoice Approval & Payment**

```
START
  │
  ├─→ [1] INVOICE RECEIPT
  │   - Receive invoice from vendor
  │   - Enter invoice details
  │   - Attach supporting documents
  │
  ├─→ [2] VERIFICATION (Accountant)
  │   - Verify invoice authenticity
  │   - Check against PO
  │   - Validate amounts & taxes
  │   - Flag discrepancies
  │
  ├─→ [3] APPROVAL (Manager/Admin)
  │   - Review verification
  │   - Approve or reject
  │   - Set payment schedule
  │
  ├─→ [4] PAYMENT TRACKING
  │   - Record partial/full payment
  │   - Update payment status
  │   - Maintain payment history
  │
  ├─→ [5] RECONCILIATION
  │   - Match payment with invoice
  │   - Update bill status
  │   - Archive invoice
  │
  └─→ END
```

---

### **Workflow 3: Financial Reporting**

```
START
  │
  ├─→ [1] DATA COLLECTION
  │   - Gather salary records
  │   - Collect payment data
  │   - Aggregate invoice data
  │
  ├─→ [2] ANALYSIS
  │   - Calculate totals
  │   - Identify trends
  │   - Compare with budget
  │
  ├─→ [3] REPORT GENERATION
  │   - Monthly payroll report
  │   - Payment summary
  │   - Financial overview
  │
  ├─→ [4] DISTRIBUTION
  │   - Send to management
  │   - Archive for audit
  │   - Update dashboards
  │
  └─→ END
```

---

## 🔌 API Endpoints

### **Salary Management**

#### Generate Monthly Salary
```
POST /api/salary/generate/:staffId
Authorization: Bearer {token}
Role: admin | manager | accountant

Request Body:
{
  "year": 2024,
  "month": 12,
  "overtimeHours": 10
}

Response:
{
  "message": "Salary generated successfully",
  "data": {
    "_id": "...",
    "staff": "...",
    "basicSalary": 30000,
    "grossSalary": 35000,
    "netSalary": 31500,
    "status": "pending"
  }
}
```

#### Approve Salary
```
PUT /api/salary/approve/:salaryId
Authorization: Bearer {token}
Role: admin | manager

Response:
{
  "message": "Salary approved successfully",
  "data": {
    "status": "approved",
    "approvedBy": "...",
    "approvedDate": "2024-12-27T10:30:00Z"
  }
}
```

#### Pay Salary
```
PUT /api/salary/pay/:salaryId
Authorization: Bearer {token}
Role: admin | manager

Request Body:
{
  "paymentMethod": "bank_transfer",
  "paymentReference": "TXN123456"
}

Response:
{
  "message": "Salary marked as paid successfully",
  "data": {
    "status": "paid",
    "paymentDate": "2024-12-30T15:45:00Z",
    "paymentMethod": "bank_transfer"
  }
}
```

#### Get Salary History
```
GET /api/salary/history/:staffId
Authorization: Bearer {token}

Query Parameters:
- year: 2024
- month: 12

Response:
{
  "data": [
    {
      "year": 2024,
      "month": 12,
      "basicSalary": 30000,
      "netSalary": 31500,
      "status": "paid",
      "paymentDate": "2024-12-30"
    }
  ]
}
```

#### Get Payslip
```
GET /api/salary/payslip/:salaryId
Authorization: Bearer {token}

Response: HTML/PDF document with formatted payslip
```

---

### **Payment Tracking** (Proposed)

#### Record Payment
```
POST /api/payments/record
Authorization: Bearer {token}
Role: admin | manager | accountant

Request Body:
{
  "billId": "...",
  "amount": 50000,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2024-12-30",
  "reference": "CHQ123456"
}

Response:
{
  "message": "Payment recorded successfully",
  "data": {
    "billId": "...",
    "amountPaid": 50000,
    "status": "partially_paid",
    "remainingAmount": 25000
  }
}
```

#### Get Payment History
```
GET /api/payments/history
Authorization: Bearer {token}

Query Parameters:
- startDate: 2024-01-01
- endDate: 2024-12-31
- status: paid | pending | partial

Response:
{
  "data": [
    {
      "billId": "...",
      "vendor": "Supplier A",
      "amount": 75000,
      "amountPaid": 50000,
      "status": "partially_paid",
      "paymentDate": "2024-12-30"
    }
  ]
}
```

---

### **Financial Reports** (Proposed)

#### Monthly Payroll Report
```
GET /api/reports/payroll
Authorization: Bearer {token}
Role: admin | manager | accountant

Query Parameters:
- year: 2024
- month: 12

Response:
{
  "month": 12,
  "year": 2024,
  "totalStaff": 45,
  "totalGrossSalary": 1500000,
  "totalDeductions": 300000,
  "totalNetSalary": 1200000,
  "paidCount": 42,
  "pendingCount": 3,
  "details": [...]
}
```

#### Financial Summary
```
GET /api/reports/financial-summary
Authorization: Bearer {token}
Role: admin | manager | accountant

Query Parameters:
- startDate: 2024-01-01
- endDate: 2024-12-31

Response:
{
  "period": "2024-01-01 to 2024-12-31",
  "totalPayroll": 14400000,
  "totalInvoices": 5000000,
  "totalPayments": 4800000,
  "pendingPayments": 200000,
  "cashFlow": {
    "inflow": 8000000,
    "outflow": 5000000,
    "netFlow": 3000000
  }
}
```

---

## 🔐 Role-Based Access Control

### **Permission Matrix**

| Action | Accountant | Manager | Admin | Staff |
|--------|-----------|---------|-------|-------|
| Generate Salary | ✅ | ❌ | ✅ | ❌ |
| Approve Salary | ❌ | ✅ | ✅ | ❌ |
| Pay Salary | ❌ | ✅ | ✅ | ❌ |
| View Own Salary | ✅ | ✅ | ✅ | ✅ |
| View All Salaries | ✅ | ✅ | ✅ | ❌ |
| Record Payment | ✅ | ❌ | ✅ | ❌ |
| Approve Invoice | ❌ | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ✅ | ✅ | ❌ |
| Audit Logs | ❌ | ❌ | ✅ | ❌ |

### **Middleware Implementation**
```javascript
// authMiddleware.js
exports.adminManagerAccountant = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     req.user.role === 'accountant')) {
        return next();
    }
    return res.status(403).json({ 
        message: 'Not authorized. Admin, Manager, or Accountant required.' 
    });
};
```

---

## 📈 Financial Reports & Analytics

### **1. Monthly Payroll Report**
```
┌─────────────────────────────────────────┐
│     MONTHLY PAYROLL REPORT - DEC 2024   │
├─────────────────────────────────────────┤
│ Total Staff:              45             │
│ Total Gross Salary:       ₹15,00,000    │
│ Total Deductions:         ₹3,00,000     │
│ Total Net Salary:         ₹12,00,000    │
│                                          │
│ Status Breakdown:                        │
│ ├─ Paid:                  42 (93%)      │
│ ├─ Approved:              2  (4%)       │
│ └─ Pending:               1  (2%)       │
│                                          │
│ Deduction Breakdown:                     │
│ ├─ Income Tax:            ₹1,50,000     │
│ ├─ PF:                    ₹90,000       │
│ ├─ ESI:                   ₹60,000       │
│ └─ Other:                 ₹0            │
└─────────────────────────────────────────┘
```

### **2. Payment Tracking Report**
```
┌──────────────────────────────────────────┐
│    PAYMENT TRACKING - DEC 2024           │
├──────────────────────────────────────────┤
│ Total Invoices:          25              │
│ Total Amount:            ₹50,00,000      │
│                                           │
│ Status Summary:                           │
│ ├─ Fully Paid:           18 (72%)        │
│ ├─ Partially Paid:       5  (20%)        │
│ └─ Pending:              2  (8%)         │
│                                           │
│ Amount Summary:                           │
│ ├─ Paid:                 ₹42,00,000      │
│ ├─ Pending:              ₹8,00,000       │
│ └─ Payment Rate:         84%             │
└──────────────────────────────────────────┘
```

### **3. Financial Overview**
```
┌─────────────────────────────────────────┐
│   FINANCIAL OVERVIEW - 2024              │
├─────────────────────────────────────────┤
│ Total Payroll (Annual):   ₹1,44,00,000  │
│ Total Invoices (Annual):  ₹60,00,000    │
│ Total Payments (Annual):  ₹57,00,000    │
│                                          │
│ Cash Flow Analysis:                      │
│ ├─ Inflow:               ₹80,00,000     │
│ ├─ Outflow:              ₹60,00,000     │
│ └─ Net Flow:             ₹20,00,000     │
│                                          │
│ Key Metrics:                             │
│ ├─ Avg Monthly Payroll:  ₹12,00,000     │
│ ├─ Avg Invoice Value:    ₹24,00,000     │
│ └─ Payment Efficiency:   95%            │
└─────────────────────────────────────────┘
```

---

## 🔍 Audit & Compliance

### **Audit Trail Requirements**
Every financial transaction must be logged with:
- **Who:** User ID and role
- **What:** Action performed (generate, approve, pay)
- **When:** Timestamp
- **Where:** Module/endpoint
- **Why:** Reason/note (if applicable)

### **Audit Log Schema**
```javascript
{
  action: 'salary_paid' | 'invoice_approved' | 'payment_recorded',
  actor: ObjectId,              // User who performed action
  actorRole: String,            // admin | manager | accountant
  target: ObjectId,             // Salary/Invoice/Payment ID
  targetType: String,           // 'salary' | 'invoice' | 'payment'
  changes: {
    before: Object,
    after: Object
  },
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

### **Compliance Checklist**
- ✅ All transactions logged with audit trail
- ✅ Role-based access control enforced
- ✅ Approval workflows documented
- ✅ Payment reconciliation completed
- ✅ Tax calculations verified
- ✅ Monthly reports generated
- ✅ Data backup maintained
- ✅ Access logs reviewed quarterly

---

## ✅ Implementation Checklist

### **Phase 1: Core Infrastructure** (Week 1-2)
- [ ] Create Invoice model
- [ ] Create Payment model
- [ ] Create AuditLog model
- [ ] Set up database indexes
- [ ] Implement audit logging middleware

### **Phase 2: Salary Module** (Week 2-3)
- [ ] Implement salary generation logic
- [ ] Create approval workflow
- [ ] Implement payment processing
- [ ] Generate payslips (HTML/PDF)
- [ ] Create salary notifications

### **Phase 3: Invoice Management** (Week 3-4)
- [ ] Build invoice creation endpoint
- [ ] Implement invoice verification
- [ ] Create approval workflow
- [ ] Build payment tracking
- [ ] Generate invoice reports

### **Phase 4: Reports & Analytics** (Week 4-5)
- [ ] Monthly payroll report
- [ ] Payment tracking report
- [ ] Financial summary report
- [ ] Dashboard widgets
- [ ] Export functionality (PDF/Excel)

### **Phase 5: Testing & Deployment** (Week 5-6)
- [ ] Unit tests for calculations
- [ ] Integration tests for workflows
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Production deployment

### **Phase 6: Documentation & Training** (Week 6)
- [ ] API documentation
- [ ] User guides
- [ ] Admin guides
- [ ] Staff training
- [ ] Go-live support

---

## 🎓 Key Takeaways

| Aspect | Details |
|--------|---------|
| **Purpose** | Financial backbone ensuring accuracy & compliance |
| **Core Functions** | Payroll, invoicing, payments, reporting |
| **Key Roles** | Accountant (generate), Manager (approve), Admin (override) |
| **Workflows** | Salary generation → Approval → Payment → Notification |
| **Audit** | Complete transaction logging for compliance |
| **Reports** | Monthly payroll, payment tracking, financial overview |
| **Security** | Role-based access, encrypted data, audit trails |

---

## 📞 Support & Questions

For implementation questions or clarifications:
- Review the API endpoints section
- Check the workflow diagrams
- Refer to the data models
- Consult the RBAC matrix

---

**Last Updated:** December 10, 2024  
**Version:** 1.0  
**Status:** Ready for Implementation
