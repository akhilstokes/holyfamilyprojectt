const Notification = require('../models/Notification');
const User = require('../models/userModel');
const Salary = require('../models/salaryModel');

/**
 * Send salary calculation notification to staff
 */
const sendSalaryNotification = async (req, res) => {
  try {
    const { staffId, salaryData, month, year } = req.body;
    
    if (!staffId || !salaryData) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID and salary data are required'
      });
    }

    // Get staff member details
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Create notification message
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const message = `Your salary for ${monthName} ${year} has been calculated. Gross: ₹${salaryData.grossSalary}, Net: ₹${salaryData.netSalary}`;
    
    // Create notification
    const notification = new Notification({
      userId: staffId,
      type: 'salary_calculation',
      title: 'Salary Calculated',
      message: message,
      data: {
        salaryId: salaryData._id,
        month: month,
        year: year,
        grossSalary: salaryData.grossSalary,
        netSalary: salaryData.netSalary,
        workingDays: salaryData.workingDays,
        deductions: salaryData.deductions
      },
      priority: 'high',
      isRead: false
    });

    await notification.save();

    // Send email notification (optional)
    try {
      const { sendEmail } = require('../utils/sendEmail');
      await sendEmail({
        to: staff.email,
        subject: `Salary Calculated - ${monthName} ${year}`,
        html: `
          <h2>Salary Calculation Complete</h2>
          <p>Dear ${staff.name},</p>
          <p>Your salary for ${monthName} ${year} has been calculated and is ready for review.</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3>Salary Details:</h3>
            <p><strong>Gross Salary:</strong> ₹${salaryData.grossSalary}</p>
            <p><strong>Net Salary:</strong> ₹${salaryData.netSalary}</p>
            <p><strong>Working Days:</strong> ${salaryData.workingDays || 'N/A'}</p>
            <p><strong>Deductions:</strong> ₹${salaryData.deductions || 0}</p>
          </div>
          <p>Please log in to your account to view detailed salary information.</p>
          <p>Thank you for your hard work!</p>
        `
      });
    } catch (emailError) {
      console.warn('Failed to send email notification:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Salary notification sent successfully',
      notification: {
        id: notification._id,
        message: notification.message,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error sending salary notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send salary notification',
      error: error.message
    });
  }
};

/**
 * Send bulk salary notifications
 */
const sendBulkSalaryNotifications = async (req, res) => {
  try {
    const { salaryCalculations } = req.body;
    
    if (!Array.isArray(salaryCalculations) || salaryCalculations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Salary calculations array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const calculation of salaryCalculations) {
      try {
        const { staffId, salaryData, month, year } = calculation;
        
        // Get staff member details
        const staff = await User.findById(staffId);
        if (!staff) {
          errors.push(`Staff member not found for ID: ${staffId}`);
          continue;
        }

        // Create notification message
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        const message = `Your salary for ${monthName} ${year} has been calculated. Gross: ₹${salaryData.grossSalary}, Net: ₹${salaryData.netSalary}`;
        
        // Create notification
        const notification = new Notification({
          userId: staffId,
          type: 'salary_calculation',
          title: 'Salary Calculated',
          message: message,
          data: {
            salaryId: salaryData._id,
            month: month,
            year: year,
            grossSalary: salaryData.grossSalary,
            netSalary: salaryData.netSalary,
            workingDays: salaryData.workingDays,
            deductions: salaryData.deductions
          },
          priority: 'high',
          isRead: false
        });

        await notification.save();
        results.push({
          staffId,
          staffName: staff.name,
          notificationId: notification._id,
          success: true
        });

      } catch (error) {
        errors.push(`Failed to send notification for staff ${calculation.staffId}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Processed ${salaryCalculations.length} salary notifications`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error sending bulk salary notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk salary notifications',
      error: error.message
    });
  }
};

/**
 * Get salary notifications for a user
 */
const getSalaryNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      userId: userId,
      type: 'salary_calculation'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      userId: userId,
      type: 'salary_calculation'
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching salary notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary notifications',
      error: error.message
    });
  }
};

/**
 * Mark salary notification as read
 */
const markSalaryNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

module.exports = {
  sendSalaryNotification,
  sendBulkSalaryNotifications,
  getSalaryNotifications,
  markSalaryNotificationRead
};
