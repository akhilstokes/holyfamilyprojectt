import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MySubmissions.css';

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/latex/requests`, config);

                // API returns { success, requests, total... }
                const payload = res.data;
                const list = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.requests)
                        ? payload.requests
                        : [];
                setSubmissions(list);
            } catch (err) {
                setError('Failed to fetch submissions.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) return <p>Loading submissions...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="activity-wrapper">
            <div className="activity-header">
                <h2>My Submission History</h2>
            </div>
            {(!Array.isArray(submissions) || submissions.length === 0) ? (
                <div className="activity-empty">
                    <p>You have not made any submissions yet.</p>
                </div>
            ) : (
                <div className="activity-card">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Volume (L)</th>
                                <th>DRC %</th>
                                <th>Amount (₹)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => {
                                const date = sub.submittedAt || sub.createdAt;
                                const volume = sub.quantity ?? sub.latexVolume;
                                const amount = (sub.actualPayment ?? sub.estimatedPayment ?? sub.calculatedAmount ?? 0);
                                return (
                                    <tr key={sub._id}>
                                        <td>{date ? new Date(date).toLocaleDateString() : '-'}</td>
                                        <td>{volume}</td>
                                        <td>{sub.drcPercentage}</td>
                                        <td>{Number(amount).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-pill ${String(sub.status || '').toLowerCase()}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MySubmissions;