import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminStaffSalaryManagement = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [activeTab, setActiveTab] = useState('templates');
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    basicSalary: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    transportAllowance: '',
    specialAllowance: '',
    providentFundRate: 12,
    professionalTaxRate: 2.5,
    incomeTaxRate: 0,
    fixedDeductions: '',
    notes: ''
  });

  // Salary generation form state
  const [salaryForm, setSalaryForm] = useState({
    bonus: '',
    overtime: '',
    notes: ''
  });

  const compactStyle = { height: 30, paddingTop: 2, paddingBottom: 2, fontSize: '0.85rem' };

  useEffect(() => {
    loadStaff();
    loadSalaryTemplates();
    loadSalaries();
  }, [currentYear, currentMonth]);

  const loadStaff = async () => {
    try {
      const response = await fetch(`${base}/api/user-management/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStaff(data.filter(user => user.role === 'admin' || user.role === 'field_staff'));
    } catch (error) {
      toast.error('Failed to load staff');
    }
  };

  const loadSalaryTemplates = async () => {
    try {
      const response = await fetch(`${base}/api/salary/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSalaryTemplates(data);
    } catch (error) {
      console.error('Failed to load salary templates:', error);
    }
  };

  const loadSalaries = async () => {
    try {
      const response = await fetch(`${base}/api/salary/all?year=${currentYear}&month=${currentMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSalaries(data.data || []);
    } catch (error) {
      toast.error('Failed to load salaries');
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/salary/template/${selectedStaff}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        toast.success('Salary template created successfully');
        setTemplateForm({
          basicSalary: '',
          houseRentAllowance: '',
          medicalAllowance: '',
          transportAllowance: '',
          specialAllowance: '',
          providentFundRate: 12,
          professionalTaxRate: 2.5,
          incomeTaxRate: 0,
          fixedDeductions: '',
          notes: ''
        });
        loadSalaryTemplates();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSalary = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${base}/api/salary/generate/${selectedStaff}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          year: currentYear,
          month: currentMonth,
          ...salaryForm
        })
      });

      if (response.ok) {
        toast.success('Salary generated successfully');
        setSalaryForm({ bonus: '', overtime: '', notes: '' });
        loadSalaries();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate salary');
      }
    } catch (error) {
      toast.error('Failed to generate salary');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSalary = async (salaryId) => {
    try {
      const response = await fetch(`${base}/api/salary/approve/${salaryId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Salary approved successfully');
        loadSalaries();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve salary');
      }
    } catch (error) {
      toast.error('Failed to approve salary');
    }
  };

  const handlePaySalary = async (salaryId) => {
    const paymentMethod = prompt('Enter payment method (bank_transfer/cash/cheque):');
    const paymentReference = prompt('Enter payment reference (optional):');

    if (!paymentMethod) return;

    try {
      const response = await fetch(`${base}/api/salary/pay/${salaryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          paymentReference: paymentReference || ''
        })
      });

      if (response.ok) {
        toast.success('Salary marked as paid');
        loadSalaries();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to mark salary as paid');
      }
    } catch (error) {
      toast.error('Failed to mark salary as paid');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-warning',
      approved: 'badge-info',
      paid: 'badge-success'
    };
    return `badge ${badges[status] || 'badge-secondary'}`;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Staff Salary Management</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('templates')}
                  >
                    Salary Templates
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('generate')}
                  >
                    Generate Salary
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'manage' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('manage')}
                  >
                    Manage Salaries
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Salary Templates Tab */}
              {activeTab === 'templates' && (
                <div style={{ maxWidth: 800 }}>
                  {/** compact controls helper */}
                  {/* eslint-disable-next-line */}
                  {(() => {})()}
                  <h4>Create Salary Template</h4>
                  <form onSubmit={handleCreateTemplate}>
                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Select Staff Member</label>
                          <select
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            required
                          >
                            <option value="">Select Staff Member</option>
                            {staff.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} ({member.email}) - {member.role}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Basic Salary *</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.basicSalary}
                            onChange={(e) => setTemplateForm({...templateForm, basicSalary: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>House Rent Allowance</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.houseRentAllowance}
                            onChange={(e) => setTemplateForm({...templateForm, houseRentAllowance: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Medical Allowance</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.medicalAllowance}
                            onChange={(e) => setTemplateForm({...templateForm, medicalAllowance: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Transport Allowance</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.transportAllowance}
                            onChange={(e) => setTemplateForm({...templateForm, transportAllowance: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Special Allowance</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.specialAllowance}
                            onChange={(e) => setTemplateForm({...templateForm, specialAllowance: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Fixed Deductions</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.fixedDeductions}
                            onChange={(e) => setTemplateForm({...templateForm, fixedDeductions: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Provident Fund Rate (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.providentFundRate}
                            onChange={(e) => setTemplateForm({...templateForm, providentFundRate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Professional Tax Rate (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.professionalTaxRate}
                            onChange={(e) => setTemplateForm({...templateForm, professionalTaxRate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Income Tax Rate (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={templateForm.incomeTaxRate}
                            onChange={(e) => setTemplateForm({...templateForm, incomeTaxRate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        className="form-control form-control-sm"
                        style={compactStyle}
                        rows="2"
                        value={templateForm.notes}
                        onChange={(e) => setTemplateForm({...templateForm, notes: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Template'}
                    </button>
                  </form>
                </div>
              )}

              {/* Generate Salary Tab */}
              {activeTab === 'generate' && (
                <div style={{ maxWidth: 800 }}>
                  <h4>Generate Monthly Salary</h4>
                  <form onSubmit={handleGenerateSalary}>
                    <div className="row">
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Select Staff Member</label>
                          <select
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            required
                          >
                            <option value="">Select Staff Member</option>
                            {staff.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} ({member.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Year</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={currentYear}
                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4 col-lg-3">
                        <div className="form-group">
                          <label>Month</label>
                          <select
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(Number(e.target.value))}
                            required
                          >
                            {Array.from({length: 12}, (_, i) => (
                              <option key={i+1} value={i+1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Bonus Amount</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={salaryForm.bonus}
                            onChange={(e) => setSalaryForm({...salaryForm, bonus: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="form-group">
                          <label>Overtime Amount</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={compactStyle}
                            value={salaryForm.overtime}
                            onChange={(e) => setSalaryForm({...salaryForm, overtime: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        className="form-control form-control-sm"
                        style={compactStyle}
                        rows="2"
                        value={salaryForm.notes}
                        onChange={(e) => setSalaryForm({...salaryForm, notes: e.target.value})}
                      />
                    </div>

                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Salary'}
                    </button>
                  </form>
                </div>
              )}

              {/* Manage Salaries Tab */}
              {activeTab === 'manage' && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h4>Manage Salaries - {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                    </div>
                    <div className="col-md-6 text-right">
                      <div className="btn-group">
                        <input
                          type="number"
                          className="form-control form-control-sm d-inline-block"
                          style={{width: '90px', ...compactStyle}}
                          value={currentYear}
                          onChange={(e) => setCurrentYear(Number(e.target.value))}
                        />
                        <select
                          className="form-control form-control-sm d-inline-block"
                          style={{width: '120px', ...compactStyle}}
                          value={currentMonth}
                          onChange={(e) => setCurrentMonth(Number(e.target.value))}
                        >
                          {Array.from({length: 12}, (_, i) => (
                            <option key={i+1} value={i+1}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Staff Name</th>
                          <th>Basic Salary</th>
                          <th>Gross Salary</th>
                          <th>Net Salary</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaries.map((salary) => (
                          <tr key={salary._id}>
                            <td>{salary.staff?.name}</td>
                            <td>₹{salary.basicSalary?.toLocaleString()}</td>
                            <td>₹{salary.grossSalary?.toLocaleString()}</td>
                            <td>₹{salary.netSalary?.toLocaleString()}</td>
                            <td>
                              <span className={getStatusBadge(salary.status)}>
                                {salary.status?.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {salary.status === 'draft' && (
                                <button
                                  className="btn btn-sm btn-info mr-2"
                                  onClick={() => handleApproveSalary(salary._id)}
                                >
                                  Approve
                                </button>
                              )}
                              {salary.status === 'approved' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handlePaySalary(salary._id)}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStaffSalaryManagement;





