import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageShifts = () => {
    const [shifts, setShifts] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [formData, setFormData] = useState({ shiftType: 'Morning', date: '', assignedStaff: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Fetch existing shifts and staff list on component mount
    useEffect(() => {
        const fetchShiftsAndStaff = async () => {
            try {
                const [shiftsRes, staffRes] = await Promise.all([
                    axios.get('/api/admin/shifts', config),
                    axios.get('/api/admin/staff', config)
                ]);
                setShifts(shiftsRes.data);
                setStaffList(staffRes.data);
                if (staffRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, assignedStaff: staffRes.data[0]._id }));
                }
            } catch (err) {
                setError('Failed to load data.');
            }
        };
        fetchShiftsAndStaff();
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post('/api/admin/shifts', formData, config);
            setMessage('Shift assigned successfully!');
            // Refresh shifts list
            const { data } = await axios.get('/api/admin/shifts', config);
            setShifts(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign shift.');
        }
    };

    return (
        <div>
            <h2>Manage Staff Shifts</h2>
            
            {/* Assign Shift Form */}
            <div className="form-container" style={{ maxWidth: '600px', marginBottom: '40px' }}>
                <h3>Assign New Shift</h3>
                {error && <div className="error-message">{error}</div>}
                {message && <div style={{ color: 'green' }}>{message}</div>}
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label>Shift Type</label>
                        <select name="shiftType" value={formData.shiftType} onChange={onChange} className="form-input">
                            <option value="Morning">Morning</option>
                            <option value="Evening">Evening</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={onChange} className="form-input" required />
                    </div>
                    <div className="input-group">
                        <label>Assign to Staff</label>
                        <select name="assignedStaff" value={formData.assignedStaff} onChange={onChange} className="form-input" required>
                            {staffList.map(staff => (
                                <option key={staff._id} value={staff._id}>{staff.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="form-button">Assign Shift</button>
                </form>
            </div>

            {/* Display Assigned Shifts */}
            <h3>Assigned Shifts</h3>
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Shift Type</th>
                        <th>Assigned Staff</th>
                    </tr>
                </thead>
                <tbody>
                    {shifts.map(shift => (
                        <tr key={shift._id}>
                            <td>{new Date(shift.date).toLocaleDateString()}</td>
                            <td>{shift.shiftType}</td>
                            <td>{shift.assignedStaff ? shift.assignedStaff.name : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageShifts;