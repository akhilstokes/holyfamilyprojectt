import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import './BulkStaffOperations.css';
// import { validateForm } from '../../utils/validation';

const BulkStaffOperations = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bulkForm, setBulkForm] = useState({
    // Attendance bulk operations
    attendanceDate: new Date().toISOString().split('T')[0],
    attendanceStatus: 'present',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    
    // Salary bulk operations
    salaryType: 'daily',
    amount: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    
    // Leave bulk operations
    leaveType: 'sick',
    leaveStartDate: new Date().toISOString().split('T')[0],
    leaveEndDate: new Date().toISOString().split('T')[0],
    leaveReason: '',
    
    // Shift bulk operations
    shiftType: 'Morning',
    weekStart: new Date().toISOString().split('T')[0],
    
    // Status bulk operations
    statusChange: 'active',
    statusReason: ''
  });

  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  const loadStaffList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStaffList(data || []);
      } else {
        throw new Error('Failed to load staff list');
      }
    } catch (error) {
      console.error('Failed to load staff list:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  const handleStaffSelection = (staffId, isSelected) => {
    if (isSelected) {
      setSelectedStaff(prev => [...prev, staffId]);
    } else {
      setSelectedStaff(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedStaff(staffList.map(staff => staff._id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleFormChange = (field, value) => {
    setBulkForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation functions for different operations
  const validateAttendanceForm = () => {
    const errors = {};
    const { attendanceDate, checkInTime, checkOutTime } = bulkForm;
    
    if (!attendanceDate) errors.attendanceDate = 'Date is required';
    if (!checkInTime) errors.checkInTime = 'Check-in time is required';
    if (!checkOutTime) errors.checkOutTime = 'Check-out time is required';
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (checkInTime && !timeRegex.test(checkInTime)) {
      errors.checkInTime = 'Invalid time format (HH:MM)';
    }
    if (checkOutTime && !timeRegex.test(checkOutTime)) {
      errors.checkOutTime = 'Invalid time format (HH:MM)';
    }
    
    // Validate check-out is after check-in
    if (checkInTime && checkOutTime) {
      const checkInMinutes = parseInt(checkInTime.split(':')[0]) * 60 + parseInt(checkInTime.split(':')[1]);
      const checkOutMinutes = parseInt(checkOutTime.split(':')[0]) * 60 + parseInt(checkOutTime.split(':')[1]);
      if (checkOutMinutes <= checkInMinutes) {
        errors.checkOutTime = 'Check-out time must be after check-in time';
      }
    }
    
    return errors;
  };

  const validateSalaryForm = () => {
    const errors = {};
    const { amount, effectiveDate } = bulkForm;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!effectiveDate) errors.effectiveDate = 'Effective date is required';
    
    return errors;
  };

  const validateLeaveForm = () => {
    const errors = {};
    const { leaveStartDate, leaveEndDate, leaveReason } = bulkForm;
    
    if (!leaveStartDate) errors.leaveStartDate = 'Start date is required';
    if (!leaveEndDate) errors.leaveEndDate = 'End date is required';
    if (!leaveReason.trim()) errors.leaveReason = 'Reason is required';
    
    // Validate end date is after start date
    if (leaveStartDate && leaveEndDate && new Date(leaveEndDate) <= new Date(leaveStartDate)) {
      errors.leaveEndDate = 'End date must be after start date';
    }
    
    return errors;
  };

  const validateShiftForm = () => {
    const errors = {};
    const { weekStart } = bulkForm;
    
    if (!weekStart) errors.weekStart = 'Week start date is required';
    
    return errors;
  };

  const validateStatusForm = () => {
    const errors = {};
    const { statusReason } = bulkForm;
    
    if (!statusReason.trim()) errors.statusReason = 'Reason is required';
    
    return errors;
  };

  // const validateCurrentForm = () => {
  //   switch (activeTab) {
  //     case 'attendance':
  //       return validateAttendanceForm();
  //     case 'salary':
  //       return validateSalaryForm();
  //     case 'leave':
  //       return validateLeaveForm();
  //     case 'shift':
  //       return validateShiftForm();
  //     case 'status':
  //       return validateStatusForm();
  //     default:
  //       return {};
  //   }
  // };

  const handleBulkAttendance = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    const validationErrors = validateAttendanceForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/bulk/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffIds: selectedStaff,
          date: bulkForm.attendanceDate,
          status: bulkForm.attendanceStatus,
          checkInTime: bulkForm.checkInTime,
          checkOutTime: bulkForm.checkOutTime
        })
      });

      if (response.ok) {
        toast.success(`Attendance updated for ${selectedStaff.length} staff members`);
        setSelectedStaff([]);
      } else {
        throw new Error('Failed to update attendance');
      }
    } catch (error) {
      console.error('Bulk attendance error:', error);
      toast.error('Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSalary = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    const validationErrors = validateSalaryForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/bulk/salary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffIds: selectedStaff,
          salaryType: bulkForm.salaryType,
          amount: Number(bulkForm.amount),
          effectiveDate: bulkForm.effectiveDate,
          reason: bulkForm.reason
        })
      });

      if (response.ok) {
        toast.success(`Salary updated for ${selectedStaff.length} staff members`);
        setSelectedStaff([]);
        setBulkForm(prev => ({ ...prev, amount: '' }));
      } else {
        throw new Error('Failed to update salary');
      }
    } catch (error) {
      console.error('Bulk salary error:', error);
      toast.error('Failed to update salary');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLeave = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    const validationErrors = validateLeaveForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/bulk/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffIds: selectedStaff,
          leaveType: bulkForm.leaveType,
          startDate: bulkForm.leaveStartDate,
          endDate: bulkForm.leaveEndDate,
          reason: bulkForm.leaveReason
        })
      });

      if (response.ok) {
        toast.success(`Leave applied for ${selectedStaff.length} staff members`);
        setSelectedStaff([]);
      } else {
        throw new Error('Failed to apply leave');
      }
    } catch (error) {
      console.error('Bulk leave error:', error);
      toast.error('Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkShift = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    const validationErrors = validateShiftForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/bulk/shift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffIds: selectedStaff,
          shiftType: bulkForm.shiftType,
          weekStart: bulkForm.weekStart
        })
      });

      if (response.ok) {
        toast.success(`Shift assigned for ${selectedStaff.length} staff members`);
        setSelectedStaff([]);
      } else {
        throw new Error('Failed to assign shift');
      }
    } catch (error) {
      console.error('Bulk shift error:', error);
      toast.error('Failed to assign shift');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select staff members');
      return;
    }

    const validationErrors = validateStatusForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/bulk/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffIds: selectedStaff,
          status: bulkForm.statusChange,
          reason: bulkForm.statusReason
        })
      });

      if (response.ok) {
        toast.success(`Status updated for ${selectedStaff.length} staff members`);
        setSelectedStaff([]);
        loadStaffList(); // Refresh the list
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Bulk status error:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'attendance', label: 'Bulk Attendance', icon: 'fas fa-user-clock' },
    { id: 'salary', label: 'Bulk Salary', icon: 'fas fa-dollar-sign' },
    { id: 'leave', label: 'Bulk Leave', icon: 'fas fa-calendar-times' },
    { id: 'shift', label: 'Bulk Shift', icon: 'fas fa-clock' },
    { id: 'status', label: 'Bulk Status', icon: 'fas fa-user-cog' }
  ];

  const renderAttendanceTab = () => (
    <div className="bulk-form">
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={bulkForm.attendanceDate}
            onChange={(e) => handleFormChange('attendanceDate', e.target.value)}
            className={errors.attendanceDate ? 'error' : ''}
          />
          {errors.attendanceDate && <div className="error-message">{errors.attendanceDate}</div>}
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            value={bulkForm.attendanceStatus}
            onChange={(e) => setBulkForm(prev => ({ ...prev, attendanceStatus: e.target.value }))}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
          </select>
        </div>
      </div>
      
      {bulkForm.attendanceStatus === 'present' && (
        <div className="form-row">
          <div className="form-group">
            <label>Check In Time</label>
            <input
              type="time"
              value={bulkForm.checkInTime}
              onChange={(e) => setBulkForm(prev => ({ ...prev, checkInTime: e.target.value }))}
              className={errors.checkInTime ? 'error' : ''}
            />
            {errors.checkInTime && <div className="error-message">{errors.checkInTime}</div>}
          </div>
          <div className="form-group">
            <label>Check Out Time</label>
            <input
              type="time"
              value={bulkForm.checkOutTime}
              onChange={(e) => setBulkForm(prev => ({ ...prev, checkOutTime: e.target.value }))}
              className={errors.checkOutTime ? 'error' : ''}
            />
            {errors.checkOutTime && <div className="error-message">{errors.checkOutTime}</div>}
          </div>
        </div>
      )}

      <button 
        className="btn btn-primary"
        onClick={handleBulkAttendance}
        disabled={loading}
      >
        {loading ? 'Updating...' : `Update Attendance for ${selectedStaff.length} Staff`}
      </button>
    </div>
  );

  const renderSalaryTab = () => (
    <div className="bulk-form">
      <div className="form-row">
        <div className="form-group">
          <label>Salary Type</label>
          <select
            value={bulkForm.salaryType}
            onChange={(e) => setBulkForm(prev => ({ ...prev, salaryType: e.target.value }))}
          >
            <option value="daily">Daily Wage</option>
            <option value="monthly">Monthly Salary</option>
            <option value="hourly">Hourly Rate</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={bulkForm.amount}
            onChange={(e) => setBulkForm(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="Enter amount"
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <div className="error-message">{errors.amount}</div>}
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Effective Date</label>
          <input
            type="date"
            value={bulkForm.effectiveDate}
            onChange={(e) => setBulkForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
            className={errors.effectiveDate ? 'error' : ''}
          />
          {errors.effectiveDate && <div className="error-message">{errors.effectiveDate}</div>}
        </div>
        <div className="form-group">
          <label>Reason</label>
          <input
            type="text"
            value={bulkForm.reason}
            onChange={(e) => setBulkForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Reason for change"
          />
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleBulkSalary}
        disabled={loading}
      >
        {loading ? 'Updating...' : `Update Salary for ${selectedStaff.length} Staff`}
      </button>
    </div>
  );

  const renderLeaveTab = () => (
    <div className="bulk-form">
      <div className="form-row">
        <div className="form-group">
          <label>Leave Type</label>
          <select
            value={bulkForm.leaveType}
            onChange={(e) => setBulkForm(prev => ({ ...prev, leaveType: e.target.value }))}
          >
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="vacation">Vacation</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={bulkForm.leaveStartDate}
            onChange={(e) => setBulkForm(prev => ({ ...prev, leaveStartDate: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={bulkForm.leaveEndDate}
            onChange={(e) => setBulkForm(prev => ({ ...prev, leaveEndDate: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label>Reason</label>
          <input
            type="text"
            value={bulkForm.leaveReason}
            onChange={(e) => setBulkForm(prev => ({ ...prev, leaveReason: e.target.value }))}
            placeholder="Reason for leave"
          />
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleBulkLeave}
        disabled={loading}
      >
        {loading ? 'Applying...' : `Apply Leave for ${selectedStaff.length} Staff`}
      </button>
    </div>
  );

  const renderShiftTab = () => (
    <div className="bulk-form">
      <div className="form-row">
        <div className="form-group">
          <label>Shift Type</label>
          <select
            value={bulkForm.shiftType}
            onChange={(e) => setBulkForm(prev => ({ ...prev, shiftType: e.target.value }))}
          >
            <option value="Morning">Morning Shift</option>
            <option value="Evening">Evening Shift</option>
          </select>
        </div>
        <div className="form-group">
          <label>Week Start (Sunday)</label>
          <input
            type="date"
            value={bulkForm.weekStart}
            onChange={(e) => setBulkForm(prev => ({ ...prev, weekStart: e.target.value }))}
          />
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleBulkShift}
        disabled={loading}
      >
        {loading ? 'Assigning...' : `Assign Shift for ${selectedStaff.length} Staff`}
      </button>
    </div>
  );

  const renderStatusTab = () => (
    <div className="bulk-form">
      <div className="form-row">
        <div className="form-group">
          <label>Status Change</label>
          <select
            value={bulkForm.statusChange}
            onChange={(e) => setBulkForm(prev => ({ ...prev, statusChange: e.target.value }))}
          >
            <option value="active">Activate</option>
            <option value="inactive">Deactivate</option>
            <option value="suspended">Suspend</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reason</label>
          <input
            type="text"
            value={bulkForm.statusReason}
            onChange={(e) => setBulkForm(prev => ({ ...prev, statusReason: e.target.value }))}
            placeholder="Reason for status change"
          />
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleBulkStatus}
        disabled={loading}
      >
        {loading ? 'Updating...' : `Update Status for ${selectedStaff.length} Staff`}
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'attendance':
        return renderAttendanceTab();
      case 'salary':
        return renderSalaryTab();
      case 'leave':
        return renderLeaveTab();
      case 'shift':
        return renderShiftTab();
      case 'status':
        return renderStatusTab();
      default:
        return null;
    }
  };

  return (
    <div className="bulk-staff-operations">
      <div className="page-header">
        <h2>Bulk Staff Operations</h2>
        <p>Perform bulk operations on multiple staff members at once</p>
      </div>

      <div className="staff-selection">
        <div className="selection-header">
          <h3>Select Staff Members</h3>
          <div className="selection-controls">
            <label className="select-all">
              <input
                type="checkbox"
                checked={selectedStaff.length === staffList.length && staffList.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All ({staffList.length})
            </label>
            <span className="selected-count">
              {selectedStaff.length} selected
            </span>
          </div>
        </div>

        <div className="staff-grid">
          {staffList.map(staff => (
            <div key={staff._id} className="staff-card">
              <label className="staff-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStaff.includes(staff._id)}
                  onChange={(e) => handleStaffSelection(staff._id, e.target.checked)}
                />
                <div className="staff-info">
                  <div className="staff-name">{staff.name}</div>
                  <div className="staff-role">{staff.role}</div>
                  {staff.staffId && (
                    <div className="staff-id">ID: {staff.staffId}</div>
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bulk-operations">
        <div className="operations-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="operations-content">
          {selectedStaff.length === 0 ? (
            <div className="no-selection">
              <i className="fas fa-users"></i>
              <p>Please select staff members to perform bulk operations</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkStaffOperations;

