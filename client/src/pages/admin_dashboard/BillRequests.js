import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // We'll create this file for styling

const BillRequests = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get('/api/admin/bills', config);
            setBills(data);
        } catch (err) {
            setError('Failed to fetch bill requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.put(`/api/admin/bills/${id}`, { status }, config);
            // Refresh the list after updating
            fetchBills();
        } catch (err) {
            setError('Failed to update status.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-content">
            <h2>Manage Bill Requests</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Supplier Name</th>
                            <th>Latex Volume (kg)</th>
                            <th>DRC (%)</th>
                            <th>Amount (₹)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill) => (
                            <tr key={bill._id}>
                                <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                <td>{bill.supplier?.name || 'N/A'}</td>
                                <td>{bill.latexVolume}</td>
                                <td>{bill.drcPercentage}</td>
                                <td>₹{bill.calculatedAmount.toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge status-${bill.status}`}>
                                        {bill.status}
                                    </span>
                                </td>
                                <td>
                                    {bill.status === 'pending' && (
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleStatusUpdate(bill._id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => handleStatusUpdate(bill._id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BillRequests;