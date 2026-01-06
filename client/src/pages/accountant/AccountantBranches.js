import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiBriefcase } from 'react-icons/fi';

const AccountantBranches = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'factory',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    contact: {
      phone: '',
      email: '',
      manager: ''
    },
    financialSettings: {
      gstNumber: '',
      panNumber: '',
      bankAccount: {
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      }
    },
    status: 'active'
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingBranch
        ? `${base}/api/accountant/branches/${editingBranch._id}`
        : `${base}/api/accountant/branches`;

      const method = editingBranch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchBranches();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'factory',
      address: { street: '', city: '', state: '', pincode: '', country: 'India' },
      contact: { phone: '', email: '', manager: '' },
      financialSettings: { gstNumber: '', panNumber: '', bankAccount: { accountNumber: '', ifscCode: '', bankName: '' } },
      status: 'active'
    });
    setEditingBranch(null);
    setShowForm(false);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      type: branch.type,
      address: branch.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      contact: branch.contact || { phone: '', email: '', manager: '' },
      financialSettings: branch.financialSettings || { gstNumber: '', panNumber: '', bankAccount: { accountNumber: '', ifscCode: '', bankName: '' } },
      status: branch.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchBranches();
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Multi-Branch Accounting</h1>
          <p className="text-slate-600 mt-1">Manage factory units and branch ledgers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FiPlus />
          <span>Add Branch</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="factory">Factory</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="office">Office</option>
                  <option value="processing_unit">Processing Unit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Financial Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.financialSettings.gstNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialSettings: { ...formData.financialSettings, gstNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.financialSettings.panNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialSettings: { ...formData.financialSettings, panNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                {editingBranch ? 'Update' : 'Create'} Branch
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 p-3 rounded-lg">
                  <FiBriefcase className="text-sky-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{branch.name}</h3>
                  <p className="text-sm text-slate-500">{branch.code}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(branch._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <FiMapPin />
                <span>{branch.address?.city || 'N/A'}, {branch.address?.state || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${branch.status === 'active' ? 'bg-green-100 text-green-700' :
                  branch.status === 'inactive' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                  {branch.status}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  {branch.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <FiBriefcase className="text-4xl text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No branches found. Create your first branch to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AccountantBranches;

