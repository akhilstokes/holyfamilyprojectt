import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiList, FiCheckCircle, FiClock, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import barrelManagementService from '../../services/barrelManagementService';
import './BarrelManagement.css';

const BarrelManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  
  // Registration Form State
  const [registrationForm, setRegistrationForm] = useState({
    barrelType: 'standard',
    capacity: '200',
    material: 'plastic',
    color: 'blue',
    quantity: 1,
    location: 'warehouse-a',
    notes: ''
  });

  // Data State
  const [barrels, setBarrels] = useState([]);
  const [barrelRequests, setBarrelRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get current date and user
  const getCurrentDate = () => new Date().toLocaleDateString('en-GB');
  const getCurrentUser = () => user?.name || 'Admin User';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [barrelsData, requestsData] = await Promise.all([
        barrelManagementService.getRegisteredBarrels(),
        barrelManagementService.getBarrelRequests()
      ]);
      setBarrels(barrelsData.barrels || []);
      setBarrelRequests(requestsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const generateBarrelId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BRL${timestamp}${random}`;
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await barrelManagementService.registerBarrels(registrationForm);
      if (response.success) {
        setBarrels(prev => [...response.barrels, ...prev]);
        setRegistrationForm({
          barrelType: 'standard',
          capacity: '200',
          material: 'plastic',
          color: 'blue',
          quantity: 1,
          location: 'warehouse-a',
          notes: ''
        });
        showNotification(`✅ Successfully registered ${registrationForm.quantity} barrel(s)!`);
      }
    } catch (error) {
      console.error('Error registering barrels:', error);
      showNotification('❌ Error registering barrels');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await barrelManagementService.approveBarrelRequest(requestId);
      await loadData();
      showNotification('✅ Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('❌ Error approving request');
    }
  };

  const filteredBarrels = barrels.filter(barrel => {
    const matchesSearch = !searchTerm || 
      barrel.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barrel.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || barrel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="barrel-management">
      {/* Success Message */}
      {showMessage && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1><FiPackage /> Barrel Management System</h1>
        <p>Complete barrel lifecycle management - Register, Track, Approve & Monitor</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <TabButton
          id="register"
          label="Register Barrels"
          icon={<FiPlus />}
          active={activeTab === 'register'}
          onClick={setActiveTab}
        />
        <TabButton
          id="inventory"
          label="Barrel Inventory"
          icon={<FiList />}
          active={activeTab === 'inventory'}
          onClick={setActiveTab}
        />
        <TabButton
          id="requests"
          label="User Requests"
          icon={<FiClock />}
          active={activeTab === 'requests'}
          onClick={setActiveTab}
        />
        <TabButton
          id="approved"
          label="Approved Barrels"
          icon={<FiCheckCircle />}
          active={activeTab === 'approved'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Register Barrels Tab */}
        {activeTab === 'register' && (
          <div className="register-tab">
            <div className="form-header">
              <h2><FiPlus /> Register New Barrels</h2>
            </div>

            {/* Auto-populated fields */}
            <div className="auto-fields">
              <div className="auto-field">
                <label>Registered By</label>
                <div className="auto-value">{getCurrentUser()}</div>
              </div>
              <div className="auto-field">
                <label>Registration Date</label>
                <div className="auto-value">{getCurrentDate()}</div>
              </div>
            </div>

            <form onSubmit={handleRegistrationSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Barrel Type *</label>
                  <select
                    value={registrationForm.barrelType}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, barrelType: e.target.value}))}
                    required
                  >
                    <option value="standard">Standard Barrel</option>
                    <option value="heavy-duty">Heavy Duty</option>
                    <option value="lightweight">Lightweight</option>
                    <option value="industrial">Industrial Grade</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacity (Liters) *</label>
                  <select
                    value={registrationForm.capacity}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, capacity: e.target.value}))}
                    required
                  >
                    <option value="100">100L</option>
                    <option value="150">150L</option>
                    <option value="200">200L</option>
                    <option value="250">250L</option>
                    <option value="300">300L</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Material *</label>
                  <select
                    value={registrationForm.material}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, material: e.target.value}))}
                    required
                  >
                    <option value="plastic">High-Grade Plastic</option>
                    <option value="steel">Stainless Steel</option>
                    <option value="aluminum">Aluminum</option>
                    <option value="composite">Composite Material</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Color *</label>
                  <select
                    value={registrationForm.color}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, color: e.target.value}))}
                    required
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={registrationForm.quantity}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, quantity: parseInt(e.target.value)}))}
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Storage Location *</label>
                  <select
                    value={registrationForm.location}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, location: e.target.value}))}
                    required
                  >
                    <option value="warehouse-a">Warehouse A</option>
                    <option value="warehouse-b">Warehouse B</option>
                    <option value="storage-yard">Storage Yard</option>
                    <option value="production-floor">Production Floor</option>
                    <option value="quality-check">Quality Check Area</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Additional Notes</label>
                  <textarea
                    value={registrationForm.notes}
                    onChange={(e) => setRegistrationForm(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Any additional information about these barrels..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : `Register ${registrationForm.quantity} Barrel${registrationForm.quantity > 1 ? 's' : ''}`}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setRegistrationForm({
                    barrelType: 'standard', capacity: '200', material: 'plastic', color: 'blue',
                    quantity: 1, location: 'warehouse-a', notes: ''
                  })}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barrel Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="inventory-header">
              <h2><FiList /> Barrel Inventory</h2>
              <div className="inventory-controls">
                <div className="search-box">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search barrels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <button className="btn-secondary" onClick={loadData}>
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>

            <div className="inventory-stats">
              <div className="stat-card">
                <div className="stat-number">{barrels.length}</div>
                <div className="stat-label">Total Barrels</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{barrels.filter(b => b.status === 'available').length}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{barrels.filter(b => b.status === 'in-use').length}</div>
                <div className="stat-label">In Use</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{barrelRequests.filter(r => r.status === 'pending').length}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>

            <div className="barrel-grid">
              {filteredBarrels.map((barrel) => (
                <div key={barrel.id} className="barrel-card">
                  <div className="barrel-header">
                    <div className="barrel-id">{barrel.id}</div>
                    <div className={`barrel-status ${barrel.status || 'available'}`}>
                      {barrel.status || 'available'}
                    </div>
                  </div>
                  <div className="barrel-details">
                    <div className="detail-row">
                      <span>Type:</span> {barrel.type}
                    </div>
                    <div className="detail-row">
                      <span>Capacity:</span> {barrel.capacity}L
                    </div>
                    <div className="detail-row">
                      <span>Material:</span> {barrel.material}
                    </div>
                    <div className="detail-row">
                      <span>Location:</span> {barrel.location}
                    </div>
                    <div className="detail-row">
                      <span>Registered:</span> {new Date(barrel.registeredDate).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Requests Tab */}
        {activeTab === 'requests' && (
          <div className="requests-tab">
            <div className="requests-header">
              <h2>
                <FiClock /> Pending User Requests
                <span className="requests-count">
                  {barrelRequests.filter(r => r.status === 'pending').length}
                </span>
              </h2>
            </div>

            <div className="requests-list">
              {barrelRequests.filter(r => r.status === 'pending').map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-info">
                    <div className="user-info">
                      <strong>{request.user?.name || 'Unknown User'}</strong>
                      <span className="user-email">{request.user?.email}</span>
                    </div>
                    <div className="request-details">
                      <div>Quantity: <strong>{request.quantity}</strong> barrels</div>
                      <div>Requested: {new Date(request.createdAt).toLocaleDateString('en-GB')}</div>
                      {request.notes && <div>Notes: {request.notes}</div>}
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveRequest(request._id)}
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Barrels Tab */}
        {activeTab === 'approved' && (
          <div className="approved-tab">
            <div className="approved-header">
              <h2><FiCheckCircle /> Approved Barrel Requests</h2>
            </div>

            <div className="approved-list">
              {barrelRequests.filter(r => r.status === 'approved').map((request) => (
                <div key={request._id} className="approved-card">
                  <div className="approved-info">
                    <div className="user-info">
                      <strong>{request.user?.name || 'Unknown User'}</strong>
                      <span className="approved-date">
                        Approved: {new Date(request.updatedAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="approved-details">
                      <div>Quantity: <strong>{request.quantity}</strong> barrels</div>
                      {request.adminNotes && <div>Admin Notes: {request.adminNotes}</div>}
                    </div>
                  </div>
                  <div className="approved-status">
                    <span className="status-badge approved">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarrelManagement;