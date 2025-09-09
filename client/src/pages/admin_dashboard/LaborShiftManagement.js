import React, { useState, useEffect } from 'react';
import './LaborShiftManagement.css';

const LaborShiftManagement = () => {
    const [shifts, setShifts] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [draggedWorker, setDraggedWorker] = useState(null);
    const [conflicts, setConflicts] = useState([]);
    const [showConflictModal, setShowConflictModal] = useState(false);

    const shiftTypes = [
        { id: 'morning', name: 'Morning Shift', time: '06:00 - 14:00', color: '#28a745' },
        { id: 'afternoon', name: 'Afternoon Shift', time: '14:00 - 22:00', color: '#ffc107' },
        { id: 'night', name: 'Night Shift', time: '22:00 - 06:00', color: '#6f42c1' }
    ];

    useEffect(() => {
        fetchWorkers();
        fetchShifts();
    }, [selectedDate]);

    const fetchWorkers = async () => {
        try {
            const response = await fetch('/api/admin/workers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setWorkers(data.workers);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    };

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/shifts?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setShifts(data.shifts);
                setConflicts(data.conflicts || []);
            }
        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, worker) => {
        setDraggedWorker(worker);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, shiftType) => {
        e.preventDefault();
        
        if (!draggedWorker) return;

        // Check for conflicts
        const hasConflict = shifts.some(shift => 
            shift.worker._id === draggedWorker._id && 
            shift.shiftType === shiftType && 
            shift.date === selectedDate
        );

        if (hasConflict) {
            alert('This worker is already assigned to this shift!');
            setDraggedWorker(null);
            return;
        }

        try {
            const response = await fetch('/api/admin/shifts/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    workerId: draggedWorker._id,
                    shiftType,
                    date: selectedDate
                })
            });

            const data = await response.json();
            
            if (data.success) {
                fetchShifts(); // Refresh shifts
            } else {
                alert('Error assigning shift: ' + data.message);
            }
        } catch (error) {
            console.error('Error assigning shift:', error);
            alert('Error assigning shift. Please try again.');
        }

        setDraggedWorker(null);
    };

    const removeWorkerFromShift = async (shiftId) => {
        try {
            const response = await fetch(`/api/admin/shifts/${shiftId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                fetchShifts(); // Refresh shifts
            } else {
                alert('Error removing worker: ' + data.message);
            }
        } catch (error) {
            console.error('Error removing worker:', error);
            alert('Error removing worker. Please try again.');
        }
    };

    const getWorkersInShift = (shiftType) => {
        return shifts.filter(shift => shift.shiftType === shiftType);
    };

    const getAvailableWorkers = () => {
        const assignedWorkerIds = shifts.map(shift => shift.worker._id);
        return workers.filter(worker => !assignedWorkerIds.includes(worker._id));
    };

    const generateShiftReport = () => {
        const reportData = {
            date: selectedDate,
            shifts: shiftTypes.map(shiftType => ({
                ...shiftType,
                workers: getWorkersInShift(shiftType.id).map(shift => ({
                    name: shift.worker.name,
                    email: shift.worker.email,
                    phone: shift.worker.phone
                }))
            })),
            conflicts: conflicts,
            summary: {
                totalWorkers: workers.length,
                assignedWorkers: shifts.length,
                availableWorkers: getAvailableWorkers().length,
                conflicts: conflicts.length
            }
        };

        // Create and download CSV
        const csvContent = [
            ['Date', 'Shift Type', 'Worker Name', 'Email', 'Phone', 'Status'],
            ...shifts.map(shift => [
                selectedDate,
                shiftTypes.find(s => s.id === shift.shiftType)?.name || shift.shiftType,
                shift.worker.name,
                shift.worker.email,
                shift.worker.phone || 'N/A',
                'Assigned'
            ]),
            ...getAvailableWorkers().map(worker => [
                selectedDate,
                'Not Assigned',
                worker.name,
                worker.email,
                worker.phone || 'N/A',
                'Available'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shift-schedule-${selectedDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="labor-shift-management">
            <div className="management-header">
                <h2>
                    <i className="fas fa-calendar-alt"></i>
                    Labor & Shift Management
                </h2>
                <p>Schedule 3-shift rotation for workers with drag-and-drop assignment</p>
            </div>

            {/* Date Selector and Actions */}
            <div className="controls-section">
                <div className="date-controls">
                    <label>Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>
                <div className="action-controls">
                    <button onClick={generateShiftReport} className="export-btn">
                        <i className="fas fa-download"></i>
                        Export Schedule
                    </button>
                    {conflicts.length > 0 && (
                        <button 
                            onClick={() => setShowConflictModal(true)}
                            className="conflict-btn"
                        >
                            <i className="fas fa-exclamation-triangle"></i>
                            View Conflicts ({conflicts.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="card-content">
                        <h3>{workers.length}</h3>
                        <p>Total Workers</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">
                        <i className="fas fa-user-check"></i>
                    </div>
                    <div className="card-content">
                        <h3>{shifts.length}</h3>
                        <p>Assigned Shifts</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">
                        <i className="fas fa-user-clock"></i>
                    </div>
                    <div className="card-content">
                        <h3>{getAvailableWorkers().length}</h3>
                        <p>Available Workers</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="card-content">
                        <h3>{conflicts.length}</h3>
                        <p>Conflicts</p>
                    </div>
                </div>
            </div>

            {/* Available Workers */}
            <div className="available-workers-section">
                <h3>Available Workers</h3>
                <div className="workers-grid">
                    {getAvailableWorkers().map(worker => (
                        <div
                            key={worker._id}
                            className="worker-card draggable"
                            draggable
                            onDragStart={(e) => handleDragStart(e, worker)}
                        >
                            <div className="worker-avatar">
                                <i className="fas fa-user"></i>
                            </div>
                            <div className="worker-info">
                                <h4>{worker.name}</h4>
                                <p>{worker.email}</p>
                                <span className="worker-role">{worker.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shift Assignment Areas */}
            <div className="shifts-section">
                <h3>Shift Assignments for {new Date(selectedDate).toLocaleDateString()}</h3>
                <div className="shifts-grid">
                    {shiftTypes.map(shiftType => (
                        <div
                            key={shiftType.id}
                            className="shift-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, shiftType.id)}
                        >
                            <div 
                                className="shift-header"
                                style={{ backgroundColor: shiftType.color }}
                            >
                                <h4>{shiftType.name}</h4>
                                <p>{shiftType.time}</p>
                            </div>
                            <div className="shift-workers">
                                {getWorkersInShift(shiftType.id).map(shift => (
                                    <div key={shift._id} className="assigned-worker">
                                        <div className="worker-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="worker-info">
                                            <h5>{shift.worker.name}</h5>
                                            <p>{shift.worker.email}</p>
                                        </div>
                                        <button
                                            onClick={() => removeWorkerFromShift(shift._id)}
                                            className="remove-btn"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                                {getWorkersInShift(shiftType.id).length === 0 && (
                                    <div className="empty-shift">
                                        <i className="fas fa-plus"></i>
                                        <p>Drag workers here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conflicts Modal */}
            {showConflictModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Shift Conflicts</h3>
                            <button onClick={() => setShowConflictModal(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            {conflicts.length === 0 ? (
                                <p>No conflicts found!</p>
                            ) : (
                                <div className="conflicts-list">
                                    {conflicts.map((conflict, index) => (
                                        <div key={index} className="conflict-item">
                                            <div className="conflict-icon">
                                                <i className="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <div className="conflict-details">
                                                <h4>{conflict.type}</h4>
                                                <p>{conflict.description}</p>
                                                <span className="conflict-worker">{conflict.workerName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaborShiftManagement;














