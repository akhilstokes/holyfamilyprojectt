import React, { useState, useEffect, useCallback } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, ProgressIndicator, Tooltip } from '../common/RoleThemeProvider';

// Enhanced Admin Dashboard
export const AdminDashboard = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [dashboardData, setDashboardData] = useState({
        attendance: { total: 0, present: 0, absent: 0 },
        stock: { latex: 0, rubberBands: 0, hangerSpace: 0 },
        barrels: { total: 0, damaged: 0, inRepair: 0, ready: 0 },
        chemicalStock: [],
        pendingApprovals: 0
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [attendanceRes, stockRes, barrelsRes, chemicalRes, approvalsRes] = await Promise.all([
                fetch('/api/workers/attendance/stats'),
                fetch('/api/stock/summary'),
                fetch('/api/barrels/stats'),
                fetch('/api/chemical/stock-history'),
                fetch('/api/approvals/pending-count')
            ]);

            const [attendance, stock, barrels, chemical, approvals] = await Promise.all([
                attendanceRes.json(),
                stockRes.json(),
                barrelsRes.json(),
                chemicalRes.json(),
                approvalsRes.json()
            ]);

            setDashboardData({
                attendance,
                stock,
                barrels,
                chemicalStock: chemical,
                pendingApprovals: approvals.count
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        // Set up real-time updates every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    const generateReport = async (reportType) => {
        try {
            const response = await fetch(`/api/reports/generate/${reportType}`, {
                method: 'POST'
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <div className="last-updated">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    <RoleButton onClick={fetchDashboardData} size="small" variant="outline">
                        <i className="fas fa-sync-alt"></i> Refresh
                    </RoleButton>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Attendance Overview */}
                <RoleDashboardCard title="Worker Attendance" icon="fas fa-users" className="attendance-card">
                    <div className="attendance-stats">
                        <div className="stat-item">
                            <span className="stat-value">{dashboardData.attendance.present}</span>
                            <span className="stat-label">Present</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{dashboardData.attendance.absent}</span>
                            <span className="stat-label">Absent</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {dashboardData.attendance.total > 0 
                                    ? Math.round((dashboardData.attendance.present / dashboardData.attendance.total) * 100)
                                    : 0}%
                            </span>
                            <span className="stat-label">Attendance Rate</span>
                        </div>
                    </div>
                    <ProgressIndicator 
                        progress={dashboardData.attendance.total > 0 
                            ? (dashboardData.attendance.present / dashboardData.attendance.total) * 100 
                            : 0
                        }
                    />
                    <div className="card-actions">
                        <RoleButton onClick={() => generateReport('attendance')} size="small">
                            <i className="fas fa-download"></i> Generate Report
                        </RoleButton>
                    </div>
                </RoleDashboardCard>

                {/* Stock Overview */}
                <RoleDashboardCard title="Stock Levels" icon="fas fa-boxes" className="stock-card">
                    <div className="stock-items">
                        <div className="stock-item">
                            <span className="stock-label">Raw Latex</span>
                            <span className="stock-value">{dashboardData.stock.latex} L</span>
                            <StatusIndicator status={dashboardData.stock.latex > 1000 ? 'success' : 'warning'}>
                                {dashboardData.stock.latex > 1000 ? 'Good' : 'Low'}
                            </StatusIndicator>
                        </div>
                        <div className="stock-item">
                            <span className="stock-label">Rubber Bands</span>
                            <span className="stock-value">{dashboardData.stock.rubberBands} units</span>
                            <StatusIndicator status={dashboardData.stock.rubberBands > 500 ? 'success' : 'warning'}>
                                {dashboardData.stock.rubberBands > 500 ? 'Good' : 'Low'}
                            </StatusIndicator>
                        </div>
                        <div className="stock-item">
                            <span className="stock-label">Hanger Space</span>
                            <span className="stock-value">{dashboardData.stock.hangerSpace}% free</span>
                            <StatusIndicator status={dashboardData.stock.hangerSpace > 20 ? 'success' : 'warning'}>
                                {dashboardData.stock.hangerSpace > 20 ? 'Available' : 'Full'}
                            </StatusIndicator>
                        </div>
                    </div>
                </RoleDashboardCard>

                {/* Barrel Status */}
                <RoleDashboardCard title="Barrel Management" icon="fas fa-drum" className="barrel-card">
                    <div className="barrel-stats">
                        <div className="barrel-item">
                            <span className="barrel-count">{dashboardData.barrels.total}</span>
                            <span className="barrel-label">Total Barrels</span>
                        </div>
                        <div className="barrel-item">
                            <span className="barrel-count">{dashboardData.barrels.damaged}</span>
                            <span className="barrel-label">Damaged</span>
                        </div>
                        <div className="barrel-item">
                            <span className="barrel-count">{dashboardData.barrels.inRepair}</span>
                            <span className="barrel-label">In Repair</span>
                        </div>
                        <div className="barrel-item">
                            <span className="barrel-count">{dashboardData.barrels.ready}</span>
                            <span className="barrel-label">Ready</span>
                        </div>
                    </div>
                    <div className="card-actions">
                        <RoleButton onClick={() => generateReport('barrels')} size="small">
                            <i className="fas fa-chart-bar"></i> Barrel Report
                        </RoleButton>
                    </div>
                </RoleDashboardCard>

                {/* Pending Approvals */}
                <RoleDashboardCard title="Pending Approvals" icon="fas fa-clock" className="approvals-card">
                    <div className="approvals-count">
                        <span className="count-value">{dashboardData.pendingApprovals}</span>
                        <span className="count-label">Items Pending</span>
                    </div>
                    <div className="card-actions">
                        <RoleButton size="small">
                            <i className="fas fa-eye"></i> Review All
                        </RoleButton>
                    </div>
                </RoleDashboardCard>

                {/* Chemical Stock History */}
                <RoleDashboardCard title="Chemical Stock History" icon="fas fa-flask" className="chemical-card">
                    <div className="chemical-list">
                        {dashboardData.chemicalStock.slice(0, 5).map((chemical, index) => (
                            <div key={index} className="chemical-item">
                                <span className="chemical-name">{chemical.name}</span>
                                <span className="chemical-quantity">{chemical.quantity} {chemical.unit}</span>
                                <StatusIndicator status={chemical.quantity > chemical.minThreshold ? 'success' : 'warning'}>
                                    {chemical.quantity > chemical.minThreshold ? 'OK' : 'Low'}
                                </StatusIndicator>
                            </div>
                        ))}
                    </div>
                </RoleDashboardCard>
            </div>
        </div>
    );
};

// Enhanced Manager Dashboard
export const ManagerDashboard = () => {
    const { userRole } = useRoleTheme();
    const [dashboardData, setDashboardData] = useState({
        pendingLeaves: 0,
        pendingBills: 0,
        attendanceVerification: 0,
        stockAlerts: [],
        barrelRepairs: []
    });

    useEffect(() => {
        fetchManagerData();
        const interval = setInterval(fetchManagerData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchManagerData = async () => {
        try {
            const [leavesRes, billsRes, attendanceRes, stockRes, repairsRes] = await Promise.all([
                fetch('/api/leaves/pending-count'),
                fetch('/api/bills/manager/pending'),
                fetch('/api/workers/attendance/verification'),
                fetch('/api/stock/alerts'),
                fetch('/api/repairs/pending')
            ]);

            const [leaves, bills, attendance, stock, repairs] = await Promise.all([
                leavesRes.json(),
                billsRes.json(),
                attendanceRes.json(),
                stockRes.json(),
                repairsRes.json()
            ]);

            setDashboardData({
                pendingLeaves: leaves.count,
                pendingBills: bills.length,
                attendanceVerification: attendance.length,
                stockAlerts: stock,
                barrelRepairs: repairs
            });
        } catch (error) {
            console.error('Error fetching manager data:', error);
        }
    };

    return (
        <div className="manager-dashboard">
            <div className="dashboard-header">
                <h2>Manager Dashboard</h2>
            </div>

            <div className="dashboard-grid">
                {/* Pending Approvals */}
                <RoleDashboardCard title="Pending Approvals" icon="fas fa-tasks" className="approvals-card">
                    <div className="approval-items">
                        <div className="approval-item">
                            <span className="approval-count">{dashboardData.pendingLeaves}</span>
                            <span className="approval-label">Leave Requests</span>
                            <Tooltip content="Click to review and approve leave requests">
                                <RoleButton size="small">Review</RoleButton>
                            </Tooltip>
                        </div>
                        <div className="approval-item">
                            <span className="approval-count">{dashboardData.pendingBills}</span>
                            <span className="approval-label">Bill Requests</span>
                            <Tooltip content="Click to review and approve bill requests">
                                <RoleButton size="small">Review</RoleButton>
                            </Tooltip>
                        </div>
                        <div className="approval-item">
                            <span className="approval-count">{dashboardData.attendanceVerification}</span>
                            <span className="approval-label">Attendance Verification</span>
                            <Tooltip content="Click to verify attendance records">
                                <RoleButton size="small">Verify</RoleButton>
                            </Tooltip>
                        </div>
                    </div>
                </RoleDashboardCard>

                {/* Stock Alerts */}
                <RoleDashboardCard title="Stock Alerts" icon="fas fa-exclamation-triangle" className="alerts-card">
                    <div className="alert-list">
                        {dashboardData.stockAlerts.map((alert, index) => (
                            <div key={index} className="alert-item">
                                <StatusIndicator status="warning">
                                    {alert.type}
                                </StatusIndicator>
                                <span className="alert-message">{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </RoleDashboardCard>

                {/* Barrel Repairs */}
                <RoleDashboardCard title="Barrel Repairs" icon="fas fa-tools" className="repairs-card">
                    <div className="repair-list">
                        {dashboardData.barrelRepairs.map((repair, index) => (
                            <div key={index} className="repair-item">
                                <span className="repair-id">Barrel #{repair.barrelId}</span>
                                <StatusIndicator status={repair.status === 'completed' ? 'success' : 'warning'}>
                                    {repair.status}
                                </StatusIndicator>
                                <Tooltip content="Click to approve repair">
                                    <RoleButton size="small" disabled={repair.status !== 'completed'}>
                                        Approve
                                    </RoleButton>
                                </Tooltip>
                            </div>
                        ))}
                    </div>
                </RoleDashboardCard>
            </div>
        </div>
    );
};

// Enhanced Labour Dashboard
export const LabourDashboard = () => {
    const { userRole } = useRoleTheme();
    const [dashboardData, setDashboardData] = useState({
        attendance: null,
        schedule: null,
        wages: { daily: 0, monthly: 0 },
        leaveBalance: 0,
        documents: []
    });

    useEffect(() => {
        fetchLabourData();
    }, []);

    const fetchLabourData = async () => {
        try {
            const [attendanceRes, scheduleRes, wagesRes, leaveRes, docsRes] = await Promise.all([
                fetch('/api/workers/me/attendance'),
                fetch('/api/workers/me/schedule'),
                fetch('/api/workers/me/wages'),
                fetch('/api/workers/me/leave-balance'),
                fetch('/api/workers/me/documents')
            ]);

            const [attendance, schedule, wages, leave, docs] = await Promise.all([
                attendanceRes.json(),
                scheduleRes.json(),
                wagesRes.json(),
                leaveRes.json(),
                docsRes.json()
            ]);

            setDashboardData({
                attendance,
                schedule,
                wages,
                leaveBalance: leave.balance,
                documents: docs
            });
        } catch (error) {
            console.error('Error fetching labour data:', error);
        }
    };

    return (
        <div className="labour-dashboard">
            <div className="dashboard-header">
                <h2>My Dashboard</h2>
            </div>

            <div className="dashboard-grid">
                {/* Attendance Status */}
                <RoleDashboardCard title="Today's Attendance" icon="fas fa-calendar-check" className="attendance-card">
                    {dashboardData.attendance ? (
                        <div className="attendance-status">
                            <StatusIndicator status={dashboardData.attendance.status === 'present' ? 'success' : 'warning'}>
                                {dashboardData.attendance.status}
                            </StatusIndicator>
                            <p>Check-in: {dashboardData.attendance.checkInTime}</p>
                            {dashboardData.attendance.checkOutTime && (
                                <p>Check-out: {dashboardData.attendance.checkOutTime}</p>
                            )}
                        </div>
                    ) : (
                        <div className="no-attendance">
                            <p>No attendance recorded for today</p>
                            <RoleButton size="small">Check In</RoleButton>
                        </div>
                    )}
                </RoleDashboardCard>

                {/* Schedule */}
                <RoleDashboardCard title="My Schedule" icon="fas fa-calendar-alt" className="schedule-card">
                    {dashboardData.schedule ? (
                        <div className="schedule-info">
                            <p><strong>Shift:</strong> {dashboardData.schedule.shift}</p>
                            <p><strong>Time:</strong> {dashboardData.schedule.startTime} - {dashboardData.schedule.endTime}</p>
                            <p><strong>Location:</strong> {dashboardData.schedule.location}</p>
                        </div>
                    ) : (
                        <p>No schedule assigned</p>
                    )}
                </RoleDashboardCard>

                {/* Wages */}
                <RoleDashboardCard title="My Wages" icon="fas fa-money-bill-wave" className="wages-card">
                    <div className="wage-info">
                        <div className="wage-item">
                            <span className="wage-label">Daily Wage</span>
                            <span className="wage-value">₹{dashboardData.wages.daily}</span>
                        </div>
                        <div className="wage-item">
                            <span className="wage-label">Monthly Total</span>
                            <span className="wage-value">₹{dashboardData.wages.monthly}</span>
                        </div>
                    </div>
                </RoleDashboardCard>

                {/* Leave Balance */}
                <RoleDashboardCard title="Leave Balance" icon="fas fa-calendar-times" className="leave-card">
                    <div className="leave-balance">
                        <span className="balance-value">{dashboardData.leaveBalance}</span>
                        <span className="balance-label">Days Remaining</span>
                    </div>
                    <div className="card-actions">
                        <RoleButton size="small">Apply Leave</RoleButton>
                    </div>
                </RoleDashboardCard>
            </div>
        </div>
    );
};

export default AdminDashboard;

