const Salary = require('../models/salaryModel');
const Invoice = require('../models/invoiceModel');
const AccountantPayment = require('../models/accountantPaymentModel');

// Get Monthly Financial Report
exports.getMonthlyFinancialReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Get salary data
    const salaryStats = await Salary.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: 1 },
          totalGrossAmount: { $sum: '$grossSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNetAmount: { $sum: '$netSalary' },
          paidSalaries: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingSalaries: {
            $sum: { $cond: [{ $in: ['$status', ['draft', 'approved']] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get invoice data
    const invoiceStats = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          pendingAmount: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
          paidInvoices: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          pendingInvoices: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'approved', 'partially_paid']] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get payment data
    const paymentStats = await AccountantPayment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const salaryData = salaryStats[0] || { 
      totalSalaries: 0, 
      totalGrossAmount: 0, 
      totalDeductions: 0, 
      totalNetAmount: 0, 
      paidSalaries: 0, 
      pendingSalaries: 0 
    };
    
    const invoiceData = invoiceStats[0] || { 
      totalInvoices: 0, 
      totalAmount: 0, 
      totalPaid: 0, 
      pendingAmount: 0, 
      paidInvoices: 0, 
      pendingInvoices: 0 
    };
    
    const paymentData = paymentStats[0] || { 
      totalPayments: 0, 
      totalAmount: 0, 
      completedPayments: 0 
    };
    
    res.json({
      data: {
        period: {
          year: parseInt(year),
          month: parseInt(month),
          startDate,
          endDate
        },
        salaries: salaryData,
        invoices: invoiceData,
        payments: paymentData,
        summary: {
          totalIncome: invoiceData.totalPaid,
          totalExpenses: salaryData.totalNetAmount,
          netCashFlow: invoiceData.totalPaid - salaryData.totalNetAmount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching monthly financial report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Yearly Financial Report
exports.getYearlyFinancialReport = async (req, res) => {
  try {
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }
    
    // Get monthly breakdown
    const monthlyBreakdown = await Salary.aggregate([
      {
        $match: {
          year: parseInt(year)
        }
      },
      {
        $group: {
          _id: '$month',
          salaryCount: { $sum: 1 },
          totalGross: { $sum: '$grossSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          totalNet: { $sum: '$netSalary' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get invoice summary
    const invoiceSummary = await Invoice.aggregate([
      {
        $match: {
          invoiceDate: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' }
        }
      }
    ]);
    
    // Get payment summary
    const paymentSummary = await AccountantPayment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const invoiceData = invoiceSummary[0] || { totalInvoices: 0, totalAmount: 0, totalPaid: 0 };
    const paymentData = paymentSummary[0] || { totalPayments: 0, totalAmount: 0 };
    
    res.json({
      data: {
        year: parseInt(year),
        monthlyBreakdown,
        invoices: invoiceData,
        payments: paymentData,
        summary: {
          totalIncome: invoiceData.totalPaid,
          totalExpenses: monthlyBreakdown.reduce((sum, month) => sum + month.totalNet, 0),
          netCashFlow: invoiceData.totalPaid - monthlyBreakdown.reduce((sum, month) => sum + month.totalNet, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching yearly financial report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Cash Flow Report
exports.getCashFlowReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get daily cash flow
    const dailyCashFlow = await AccountantPayment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
          },
          totalInflow: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get salary payments for outflow
    const salaryPayments = await Salary.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
          },
          totalOutflow: { $sum: '$netSalary' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      data: {
        period: {
          startDate: start,
          endDate: end
        },
        inflow: dailyCashFlow,
        outflow: salaryPayments,
        netFlow: dailyCashFlow.map(day => {
          const outflowDay = salaryPayments.find(s => s._id === day._id);
          return {
            date: day._id,
            inflow: day.totalInflow,
            outflow: outflowDay ? outflowDay.totalOutflow : 0,
            net: day.totalInflow - (outflowDay ? outflowDay.totalOutflow : 0)
          };
        })
      }
    });
  } catch (error) {
    console.error('Error fetching cash flow report:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};