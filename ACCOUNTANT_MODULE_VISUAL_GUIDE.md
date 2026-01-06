# 🎨 Accountant Module – Visual Guide & Diagrams

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNTANT MODULE                             │
│                  (Financial Backbone)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   PAYROLL        │  │   INVOICE        │  │   PAYMENT    │  │
│  │   PROCESSING     │  │   MANAGEMENT     │  │   TRACKING   │  │
│  │                  │  │                  │  │              │  │
│  │ • Generate       │  │ • Create         │  │ • Record     │  │
│  │ • Calculate      │  │ • Verify         │  │ • Reconcile  │  │
│  │ • Approve        │  │ • Approve        │  │ • Report     │  │
│  │ • Pay            │  │ • Track Payment  │  │ • Audit      │  │
│  │ • Notify         │  │ • Archive        │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────┘  │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │   DATABASE MODELS       │                  │
│                    │                         │                  │
│                    │ • Salary                │                  │
│                    │ • Invoice               │                  │
│                    │ • Payment               │                  │
│                    │ • AuditLog              │                  │
│                    │ • SalarySummary         │                  │
│                    └────────────┬────────────┘                  │
│                                 │                               │
│         ┌───────────────────────┼───────────────────────┐       │
│         │                       │                       │       │
│    ┌────▼────┐          ┌──────▼──────┐         ┌─────▼──┐    │
│    │ REPORTS │          │   AUDIT     │         │NOTIFY  │    │
│    │ & STATS │          │   LOGS      │         │STAFF   │    │
│    │         │          │             │         │        │    │
│    │ • Daily │          │ • Track all │         │ • Email│    │
│    │ • Weekly│          │   actions   │         │ • SMS  │    │
│    │ • Monthly          │ • Compliance│         │ • App  │    │
│    │ • Annual│          │ • Audit     │         │        │    │
│    └─────────┘          └─────────────┘         └────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Monthly Payroll Processing Workflow

```
                    ┌─────────────────────┐
                    │   START OF MONTH    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  ATTENDANCE DATA    │
                    │  COLLECTION         │
                    │  (Days 1-25)        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  SALARY GENERATION  │
                    │  (Accountant)       │
                    │  • Fetch template   │
                    │  • Calculate gross  │
                    │  • Apply deductions │
                    │  • Generate payslip │
                    │  Status: PENDING    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  SALARY APPROVAL    │
                    │  (Manager/Admin)    │
                    │  • Review details   │
                    │  • Verify calc      │
                    │  • Approve/Reject   │
                    │  Status: APPROVED   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  PAYMENT PROCESSING │
                    │  (Accountant)       │
                    │  • Select method    │
                    │  • Record reference │
                    │  • Update date      │
                    │  Status: PAID       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  STAFF NOTIFICATION │
                    │  • Send email       │
                    │  • In-app notify    │
                    │  • Log entry        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   ARCHIVE & REPORT  │
                    │  • Archive records  │
                    │  • Generate report  │
                    │  • Send to mgmt     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   END OF MONTH      │
                    └─────────────────────┘
```

---

## 💳 Invoice Processing Workflow

```
        ┌─────────────────────┐
        │  INVOICE RECEIPT    │
        │  from Vendor        │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  DATA ENTRY         │
        │  • Invoice number   │
        │  • Vendor name      │
        │  • Amount           │
        │  • Items            │
        │  • Tax              │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  VERIFICATION       │
        │  (Accountant)       │
        │  ✓ Authenticity     │
        │  ✓ Against PO       │
        │  ✓ Amounts          │
        │  ✓ Tax rates        │
        │  ✓ Discrepancies    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  APPROVAL           │
        │  (Manager/Admin)    │
        │  ✓ Review verify    │
        │  ✓ Approve/Reject   │
        │  ✓ Set payment plan │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  PAYMENT TRACKING   │
        │  • Record payment   │
        │  • Update status    │
        │  • Track history    │
        │  Status:            │
        │  PENDING →          │
        │  PARTIAL →          │
        │  PAID               │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  RECONCILIATION     │
        │  • Match payment    │
        │  • Update bill      │
        │  • Archive          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  COMPLETE           │
        └─────────────────────┘
```

---

## 💰 Salary Calculation Flow

```
┌──────────────────────────────────────────────────────────┐
│              SALARY CALCULATION PROCESS                   │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  INPUT DATA                                               │
│  ├─ Basic Salary: ₹30,000                                │
│  ├─ Attendance: 26 days                                  │
│  ├─ Overtime: 10 hours                                   │
│  └─ Deduction Rates: Tax 10%, PF 12%, ESI 4.75%         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ STEP 1: CALCULATE ALLOWANCES                       │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ HRA (10% of Basic):        ₹3,000                  │  │
│  │ Medical Allowance:         ₹1,000                  │  │
│  │ Transport Allowance:       ₹1,500                  │  │
│  │ Special Allowance:         ₹500                    │  │
│  │ Overtime (10 × ₹50):       ₹500                    │  │
│  │ ─────────────────────────────────                  │  │
│  │ Total Allowances:          ₹6,500                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ STEP 2: CALCULATE GROSS SALARY                     │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Basic Salary:              ₹30,000                 │  │
│  │ + Total Allowances:        ₹6,500                  │  │
│  │ ─────────────────────────────────                  │  │
│  │ GROSS SALARY:              ₹36,500                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ STEP 3: CALCULATE DEDUCTIONS                       │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Income Tax (10%):          ₹3,650                  │  │
│  │ Provident Fund (12%):      ₹4,380                  │  │
│  │ ESI (4.75%):               ₹1,734                  │  │
│  │ Other Deductions:          ₹0                      │  │
│  │ ─────────────────────────────────                  │  │
│  │ TOTAL DEDUCTIONS:          ₹9,764                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ STEP 4: CALCULATE NET SALARY                       │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Gross Salary:              ₹36,500                 │  │
│  │ - Total Deductions:        ₹9,764                  │  │
│  │ ─────────────────────────────────                  │  │
│  │ NET SALARY:                ₹26,736                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              ROLE-BASED ACCESS CONTROL                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ACCOUNTANT  │  │   MANAGER    │  │    ADMIN     │      │
│  │              │  │              │  │              │      │
│  │ ✅ Generate  │  │ ✅ Approve   │  │ ✅ Override  │      │
│  │ ✅ Calculate │  │ ✅ Pay       │  │ ✅ Audit     │      │
│  │ ✅ Track     │  │ ✅ Review    │  │ ✅ Configure │      │
│  │ ✅ Report    │  │ ✅ Authorize │  │ ✅ All Tasks │      │
│  │              │  │              │  │              │      │
│  │ ❌ Approve   │  │ ❌ Generate  │  │              │      │
│  │ ❌ Pay       │  │ ❌ Calculate │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐                                            │
│  │    STAFF     │                                            │
│  │              │                                            │
│  │ ✅ View Own  │                                            │
│  │ ✅ Download  │                                            │
│  │ ✅ Payslip   │                                            │
│  │              │                                            │
│  │ ❌ View All  │                                            │
│  │ ❌ Approve   │                                            │
│  │ ❌ Manage    │                                            │
│  └──────────────┘                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Status Transition Diagrams

### Salary Status Transitions
```
                    ┌─────────────┐
                    │   PENDING   │
                    │             │
                    │ Awaiting    │
                    │ Approval    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  APPROVED   │
                    │             │
                    │ Awaiting    │
                    │ Payment     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    PAID     │
                    │             │
                    │ Completed   │
                    │             │
                    └─────────────┘
```

### Invoice Status Transitions
```
    ┌─────────────┐
    │   PENDING   │
    │             │
    │ Awaiting    │
    │ Approval    │
    └──────┬──────┘
           │
    ┌──────▼──────────┐
    │   APPROVED      │
    │                 │
    │ Awaiting        │
    │ Payment         │
    └──────┬──────────┘
           │
    ┌──────▼──────────────────┐
    │  PARTIALLY PAID          │
    │                          │
    │ Awaiting remaining       │
    │ payment                  │
    └──────┬───────────────────┘
           │
    ┌──────▼──────┐
    │    PAID     │
    │             │
    │ Completed   │
    │             │
    └─────────────┘
```

---

## 📈 Financial Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│           ACCOUNTANT FINANCIAL DASHBOARD                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────┐  ┌────────────────────┐              │
│  │  PAYROLL SUMMARY   │  │ INVOICE SUMMARY    │              │
│  ├────────────────────┤  ├────────────────────┤              │
│  │ Total Staff: 45    │  │ Total Invoices: 25 │              │
│  │ Gross: ₹15,00,000  │  │ Total Amount: ₹50L │              │
│  │ Net: ₹12,00,000    │  │ Paid: ₹42,00,000   │              │
│  │ Paid: 42/45 (93%)  │  │ Pending: ₹8,00,000 │              │
│  └────────────────────┘  └────────────────────┘              │
│                                                                │
│  ┌────────────────────┐  ┌────────────────────┐              │
│  │ PAYMENT TRACKING   │  │ CASH FLOW          │              │
│  ├────────────────────┤  ├────────────────────┤              │
│  │ Pending: ₹8,00,000 │  │ Inflow: ₹80,00,000 │              │
│  │ Overdue: 3         │  │ Outflow: ₹60,00,000│              │
│  │ Rate: 84%          │  │ Net: ₹20,00,000    │              │
│  │ Avg Days: 15       │  │ Trend: ↗ Positive  │              │
│  └────────────────────┘  └────────────────────┘              │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ RECENT TRANSACTIONS                                  │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ • Salary paid to John Doe - ₹26,736 (Dec 30)        │    │
│  │ • Invoice INV025 approved - ₹50,000 (Dec 29)        │    │
│  │ • Payment recorded - ₹25,000 (Dec 28)               │    │
│  │ • Salary generated for 45 staff (Dec 26)            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ALERTS & NOTIFICATIONS                               │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ ⚠️  3 invoices overdue                               │    │
│  │ ✅ All December salaries approved                    │    │
│  │ ⏳ 2 invoices pending approval                       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔍 Audit Trail Visualization

```
┌──────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL LOG                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Timestamp          │ Action          │ Actor      │ Target    │
│────────────────────┼─────────────────┼────────────┼──────────│
│ 2024-12-30 15:45   │ salary_paid     │ Manager    │ SAL001   │
│ 2024-12-30 14:30   │ invoice_approved│ Manager    │ INV025   │
│ 2024-12-30 10:15   │ payment_recorded│ Accountant │ INV024   │
│ 2024-12-26 09:00   │ salary_generated│ Accountant │ SAL001   │
│ 2024-12-25 16:45   │ invoice_created │ Accountant │ INV025   │
│                                                                │
│ Each entry contains:                                          │
│ ✓ WHO: User ID and role                                      │
│ ✓ WHAT: Action performed                                     │
│ ✓ WHEN: Exact timestamp                                      │
│ ✓ WHERE: Module/endpoint                                     │
│ ✓ WHY: Reason/note                                           │
│ ✓ CHANGES: Before/after values                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 User Interface Mockup

### Salary Management Page
```
┌─────────────────────────────────────────────────────────┐
│ SALARY MANAGEMENT                    [Filter] [Export]  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Month: [December ▼] Year: [2024 ▼]                 │ │
│ │ Status: [All ▼]                                     │ │
│ │ [Generate Salaries] [Approve All] [Pay All]        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Staff Name    │ Gross  │ Deductions │ Net  │ Status │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ John Doe      │ 36,500 │ 9,764      │26,736│ ✅ Paid│ │
│ │ Jane Smith    │ 35,000 │ 9,100      │25,900│ ✅ Paid│ │
│ │ Mike Johnson  │ 38,000 │ 10,200     │27,800│ ⏳ Appr│ │
│ │ Sarah Lee     │ 32,000 │ 8,500      │23,500│ ⏳ Pend│ │
│ │ ...           │ ...    │ ...        │ ...  │ ...   │ │
│ │                                                      │ │
│ │ [View Details] [Download Payslip] [Approve] [Pay]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Invoice Management Page
```
┌─────────────────────────────────────────────────────────┐
│ INVOICE MANAGEMENT                   [Filter] [Export]  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [+ New Invoice]                                     │ │
│ │ Status: [All ▼] Vendor: [All ▼] Date Range: [  ]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Invoice # │ Vendor │ Amount │ Paid │ Status │ Action│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ INV025    │ Supp A │ 50,000 │50,000│ ✅ Paid│ View │ │
│ │ INV024    │ Supp B │ 75,000 │50,000│ ⏳ Part│ Pay  │ │
│ │ INV023    │ Supp C │ 25,000 │ 0    │ ⏳ Pend│ Appr │ │
│ │ INV022    │ Supp A │ 60,000 │60,000│ ✅ Paid│ View │ │
│ │ ...       │ ...    │ ...    │ ...  │ ...   │ ...  │ │
│ │                                                      │ │
│ │ [View Details] [Approve] [Record Payment] [Archive] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Data Relationship Diagram

```
┌──────────────┐
│    USER      │
│              │
│ • _id        │
│ • name       │
│ • email      │
│ • role       │
│ • status     │
└──────┬───────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       │                  │                  │                  │
    ┌──▼──────┐      ┌───▼────┐      ┌─────▼──┐      ┌───────▼─┐
    │ SALARY   │      │INVOICE │      │PAYMENT │      │AUDIT LOG│
    │          │      │        │      │        │      │         │
    │ • staff  │      │• vendor│      │• invoice      │• actor  │
    │ • year   │      │• amount│      │• amount       │• action │
    │ • month  │      │• status│      │• method       │• target │
    │ • gross  │      │• items │      │• date         │• changes│
    │ • net    │      │• paid  │      │• status       │• time   │
    │ • status │      │        │      │        │      │         │
    └──────────┘      └────────┘      └────────┘      └─────────┘
```

---

## 📅 Implementation Timeline Gantt Chart

```
Phase 1: Database Setup (Week 1-2)
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 2: Controllers & Routes (Week 2-3)
░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 3: Invoice Management (Week 3-4)
░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 4: Reports & Analytics (Week 4-5)
░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 5: Testing & Deployment (Week 5-6)
░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Phase 6: Documentation & Training (Week 6)
░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Legend: ████ = In Progress  ░░░░ = Pending
```

---

## 🎯 Key Performance Indicators (KPIs)

```
┌─────────────────────────────────────────────────────────┐
│              ACCOUNTANT MODULE KPIs                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ 📊 PAYROLL METRICS                                      │
│ ├─ Salary Processing Time: < 2 days                     │
│ ├─ Approval Rate: > 95%                                 │
│ ├─ Payment Accuracy: 99.9%                              │
│ └─ Staff Satisfaction: > 4.5/5                          │
│                                                           │
│ 💳 INVOICE METRICS                                      │
│ ├─ Invoice Processing Time: < 5 days                    │
│ ├─ Payment On-Time Rate: > 90%                          │
│ ├─ Invoice Accuracy: 99.5%                              │
│ └─ Vendor Satisfaction: > 4/5                           │
│                                                           │
│ 💰 FINANCIAL METRICS                                    │
│ ├─ Cash Flow Efficiency: > 85%                          │
│ ├─ Payment Reconciliation: 100%                         │
│ ├─ Audit Compliance: 100%                               │
│ └─ Error Rate: < 0.5%                                   │
│                                                           │
│ ⏱️  OPERATIONAL METRICS                                 │
│ ├─ System Uptime: > 99.5%                               │
│ ├─ Response Time: < 2 seconds                           │
│ ├─ Data Backup: Daily                                   │
│ └─ Audit Trail: Complete                                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 DEPLOYMENT ARCHITECTURE                   │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │              FRONTEND (React)                     │   │
│  │  • Salary Dashboard                              │   │
│  │  • Invoice Management                            │   │
│  │  • Payment Tracking                              │   │
│  │  • Reports & Analytics                           │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────────┐   │
│  │         API GATEWAY (Express.js)                 │   │
│  │  • Authentication & Authorization                │   │
│  │  • Rate Limiting                                 │   │
│  │  • Request Validation                            │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────────┐   │
│  │      BUSINESS LOGIC (Controllers)                │   │
│  │  • Salary Processing                             │   │
│  │  • Invoice Management                            │   │
│  │  • Payment Tracking                              │   │
│  │  • Report Generation                             │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                   │
│  ┌────────────────────▼─────────────────────────────┐   │
│  │       DATA LAYER (MongoDB)                       │   │
│  │  • Salary Collection                             │   │
│  │  • Invoice Collection                            │   │
│  │  • Payment Collection                            │   │
│  │  • Audit Log Collection                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │      SUPPORTING SERVICES                         │   │
│  │  • Email Service (Notifications)                 │   │
│  │  • PDF Service (Payslips)                        │   │
│  │  • Backup Service (Data Protection)              │   │
│  │  • Logging Service (Audit Trail)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

**Last Updated:** December 10, 2024  
**Version:** 1.0  
**Status:** Complete

---

## 📞 Quick Links

- **System Design:** ACCOUNTANT_MODULE_SYSTEM_DESIGN.md
- **Implementation:** ACCOUNTANT_MODULE_IMPLEMENTATION.md
- **Quick Reference:** ACCOUNTANT_MODULE_QUICK_REFERENCE.md
- **Visual Guide:** ACCOUNTANT_MODULE_VISUAL_GUIDE.md (this file)

---

All diagrams and visuals are ASCII-based for easy viewing in any text editor! 🎨
