import React, { useState } from 'react';
import axios from 'axios';

const SubmitRequest = () => {
    const [formData, setFormData] = useState({ latexVolume: '', drcPercentage: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { latexVolume, drcPercentage } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => {
        // Clear previous messages
        setError('');
        setMessage('');

        // Convert to numbers for checking
        const numLatexVolume = parseFloat(latexVolume);
        const numDrcPercentage = parseFloat(drcPercentage);

        if (!latexVolume || !drcPercentage) {
            setError("Please fill in all fields.");
            return false;
        }
        if (isNaN(numLatexVolume) || isNaN(numDrcPercentage)) {
            setError("Inputs must be valid numbers.");
            return false;
        }
        if (numLatexVolume <= 0 || numDrcPercentage <= 0) {
            setError("Values must be greater than zero.");
            return false;
        }
        return true;
    };

    const onSubmit = async e => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const companyRate = 1.5; // Example rate
            
            // Send numbers to the backend, not strings
            const submissionData = { 
                latexVolume: parseFloat(latexVolume), 
                drcPercentage: parseFloat(drcPercentage), 
                companyRate 
            };

            await axios.post('/api/users/submit-bill', submissionData, config);
            setMessage('Your request has been submitted successfully!');
            setFormData({ latexVolume: '', drcPercentage: '' }); // Clear form
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Submit New Latex Sell Request</h2>
            <div className="form-container" style={{maxWidth: '600px'}}>
                 {error && <div className="error-message">{error}</div>}
                 {message && <div style={{color: 'green', marginBottom: '20px', textAlign: 'center'}}>{message}</div>}
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label>Latex Volume (in Liters)</label>
                        <input className="form-input" type="number" name="latexVolume" value={latexVolume} onChange={onChange} />
                    </div>
                    <div className="input-group">
                        <label>Dry Rubber Content (DRC %)</label>
                        <input className="form-input" type="number" name="drcPercentage" value={drcPercentage} onChange={onChange} />
                    </div>
                    <button className="form-button" type="submit">Submit Request</button>
                </form>
            </div>
        </div>
    );
};

export default SubmitRequest;