import React, { useState, useEffect } from 'react';
import './WorkerReport.css';

const WorkerReport = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        origin: '',
        active: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        kerala: 0,
        other: 0,
        totalWage: 0
    });

    useEffect(() => {
        fetchWorkers();
    }, [filters]);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('q', filters.search);
            if (filters.origin) queryParams.append('origin', filters.origin);
            if (filters.active !== '') queryParams.append('active', filters.active);

            const response = await fetch(`/api/workers?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setWorkers(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (workerData) => {
        const total = workerData.length;
        const active = workerData.filter(w => w.isActive).length;
        const inactive = total - active;
        const kerala = workerData.filter(w => w.origin === 'kerala').length;
        const other = total - kerala;
        const totalWage = workerData.reduce((sum, w) => sum + (w.dailyWage || 0), 0);

        setStats({
            total,
            active,
            inactive,
            kerala,
            other,
            totalWage
        });
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Contact', 'Aadhaar', 'Origin', 'Daily Wage', 'Status', 'Created Date'];
        const csvContent = [
            headers.join(','),
            ...workers.map(worker => [
                `"${worker.name}"`,
                `"${worker.contactNumber || ''}"`,
                `"${worker.aadhaarNumber || ''}"`,
                `"${worker.origin}"`,
                worker.dailyWage || 0,
                worker.isActive ? 'Active' : 'Inactive',
                new Date(worker.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worker-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredWorkers = workers.filter(worker => {
        const matchesSearch = !filters.search || 
            worker.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            worker.contactNumber?.includes(filters.search) ||
            worker.aadhaarNumber?.includes(filters.search);
        
        const matchesOrigin = !filters.origin || worker.origin === filters.origin;
        const matchesActive = filters.active === '' || worker.isActive.toString() === filters.active;
        
        return matchesSearch && matchesOrigin && matchesActive;
    });

    return (
        <div className="worker-report">
            <div className="page-header">
                <h1>Worker Report</h1>
                <div className="header-actions">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={exportToCSV}
                        disabled={workers.length === 0}
                    >
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">Total Workers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <i className="fas fa-user-check"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-label">Active Workers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon inactive">
                        <i className="fas fa-user-times"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.inactive}</div>
                        <div className="stat-label">Inactive Workers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon kerala">
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.kerala}</div>
                        <div className="stat-label">Kerala Origin</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon other">
                        <i className="fas fa-globe"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.other}</div>
                        <div className="stat-label">Other Origin</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon wage">
                        <i className="fas fa-rupee-sign"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">₹{stats.totalWage.toLocaleString()}</div>
                        <div className="stat-label">Total Daily Wage</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search by name, contact, or Aadhaar..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={filters.origin}
                        onChange={(e) => setFilters({...filters, origin: e.target.value})}
                        className="filter-select"
                    >
                        <option value="">All Origins</option>
                        <option value="kerala">Kerala</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filters.active}
                        onChange={(e) => setFilters({...filters, active: e.target.value})}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Workers Table */}
            <div className="workers-table-container">
                {loading ? (
                    <div className="loading">Loading worker data...</div>
                ) : (
                    <table className="workers-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Aadhaar</th>
                                <th>Origin</th>
                                <th>Daily Wage</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkers.map(worker => (
                                <tr key={worker._id}>
                                    <td>
                                        <div className="worker-name">
                                            <strong>{worker.name}</strong>
                                            {worker.user && (
                                                <small className="user-link">
                                                    Linked to: {worker.user.name}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div>{worker.contactNumber || '-'}</div>
                                            {worker.emergencyContactNumber && (
                                                <small>Emergency: {worker.emergencyContactNumber}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>{worker.aadhaarNumber || '-'}</td>
                                    <td>
                                        <span className={`origin-badge ${worker.origin}`}>
                                            {worker.origin}
                                        </span>
                                    </td>
                                    <td>₹{worker.dailyWage || 0}</td>
                                    <td>
                                        <span className={`status-badge ${worker.isActive ? 'active' : 'inactive'}`}>
                                            {worker.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(worker.createdAt).toLocaleDateString()}</td>
                                    <td>{new Date(worker.updatedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {filteredWorkers.length === 0 && !loading && (
                <div className="no-data">
                    <i className="fas fa-users"></i>
                    <h3>No workers found</h3>
                    <p>Try adjusting your search filters</p>
                </div>
            )}
        </div>
    );
};

export default WorkerReport;







