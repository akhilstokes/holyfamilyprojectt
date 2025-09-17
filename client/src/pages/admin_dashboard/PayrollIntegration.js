import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './PayrollIntegration.css';

const PayrollIntegration = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [exportData, setExportData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    format: 'excel',
    includeDetails: true
  });

  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`${base}/api/admin/payroll/integrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const handleExportPayroll = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/payroll/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll-${exportData.year}-${exportData.month}.${exportData.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Payroll data exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToExternal = async (integrationId) => {
    try {
      setLoading(true);
      const response = await fetch(`${base}/api/admin/payroll/sync/${integrationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          month: exportData.month,
          year: exportData.year
        })
      });

      if (response.ok) {
        toast.success('Payroll data synced successfully');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync payroll data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'export', label: 'Export Payroll', icon: 'fas fa-download' },
    { id: 'integrations', label: 'External Integrations', icon: 'fas fa-plug' },
    { id: 'templates', label: 'Payroll Templates', icon: 'fas fa-file-alt' },
    { id: 'settings', label: 'Integration Settings', icon: 'fas fa-cog' }
  ];

  const renderExportTab = () => (
    <div className="export-section">
      <div className="export-form">
        <h3>Export Payroll Data</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Month</label>
            <select
              value={exportData.month}
              onChange={(e) => setExportData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Year</label>
            <select
              value={exportData.year}
              onChange={(e) => setExportData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Format</label>
            <select
              value={exportData.format}
              onChange={(e) => setExportData(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={exportData.includeDetails}
                onChange={(e) => setExportData(prev => ({ ...prev, includeDetails: e.target.checked }))}
              />
              Include detailed breakdown
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExportPayroll}
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export Payroll Data'}
        </button>
      </div>

      <div className="export-preview">
        <h4>Export Preview</h4>
        <div className="preview-card">
          <div className="preview-item">
            <span className="label">Period:</span>
            <span className="value">
              {new Date(0, exportData.month - 1).toLocaleString('default', { month: 'long' })} {exportData.year}
            </span>
          </div>
          <div className="preview-item">
            <span className="label">Format:</span>
            <span className="value">{exportData.format.toUpperCase()}</span>
          </div>
          <div className="preview-item">
            <span className="label">Details:</span>
            <span className="value">{exportData.includeDetails ? 'Included' : 'Summary only'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="integrations-section">
      <div className="integrations-header">
        <h3>External Payroll Integrations</h3>
        <button className="btn btn-outline-primary">
          <i className="fas fa-plus"></i> Add Integration
        </button>
      </div>

      <div className="integrations-grid">
        {integrations.map(integration => (
          <div key={integration.id} className="integration-card">
            <div className="integration-header">
              <div className="integration-icon">
                <i className={integration.icon}></i>
              </div>
              <div className="integration-info">
                <h4>{integration.name}</h4>
                <p>{integration.description}</p>
              </div>
              <div className={`integration-status ${integration.status}`}>
                {integration.status}
              </div>
            </div>

            <div className="integration-details">
              <div className="detail-item">
                <span className="label">Last Sync:</span>
                <span className="value">{integration.lastSync || 'Never'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Records Synced:</span>
                <span className="value">{integration.recordsSynced || 0}</span>
              </div>
            </div>

            <div className="integration-actions">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleSyncToExternal(integration.id)}
                disabled={loading}
              >
                <i className="fas fa-sync"></i> Sync Now
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="fas fa-cog"></i> Configure
              </button>
            </div>
          </div>
        ))}

        {integrations.length === 0 && (
          <div className="no-integrations">
            <i className="fas fa-plug"></i>
            <h4>No Integrations Configured</h4>
            <p>Connect with external payroll systems to streamline your workflow</p>
            <button className="btn btn-primary">
              <i className="fas fa-plus"></i> Add Your First Integration
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="templates-section">
      <div className="templates-header">
        <h3>Payroll Templates</h3>
        <button className="btn btn-outline-primary">
          <i className="fas fa-plus"></i> Create Template
        </button>
      </div>

      <div className="templates-grid">
        <div className="template-card">
          <div className="template-icon">
            <i className="fas fa-file-excel"></i>
          </div>
          <div className="template-info">
            <h4>Standard Payroll Export</h4>
            <p>Basic payroll data with employee details and salary information</p>
          </div>
          <div className="template-actions">
            <button className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download"></i> Download
            </button>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>

        <div className="template-card">
          <div className="template-icon">
            <i className="fas fa-file-pdf"></i>
          </div>
          <div className="template-info">
            <h4>Detailed Payroll Report</h4>
            <p>Comprehensive payroll report with deductions and benefits</p>
          </div>
          <div className="template-actions">
            <button className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download"></i> Download
            </button>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>

        <div className="template-card">
          <div className="template-icon">
            <i className="fas fa-file-csv"></i>
          </div>
          <div className="template-info">
            <h4>Bank Transfer Format</h4>
            <p>CSV format compatible with bank bulk transfer systems</p>
          </div>
          <div className="template-actions">
            <button className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download"></i> Download
            </button>
            <button className="btn btn-sm btn-outline-secondary">
              <i className="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-section">
      <h3>Integration Settings</h3>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h4>General Settings</h4>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Auto-sync on payroll generation
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              Send notifications on sync completion
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Include backup data in exports
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h4>Data Privacy</h4>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Encrypt sensitive data in exports
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              Anonymize employee data
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Auto-delete temporary files
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h4>Backup & Recovery</h4>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Create backup before sync
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              Store backup in cloud
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Keep backup for 30 days
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary">
          <i className="fas fa-save"></i> Save Settings
        </button>
        <button className="btn btn-outline-secondary">
          <i className="fas fa-undo"></i> Reset to Default
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'export':
        return renderExportTab();
      case 'integrations':
        return renderIntegrationsTab();
      case 'templates':
        return renderTemplatesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  return (
    <div className="payroll-integration">
      <div className="page-header">
        <h2>Payroll Integration</h2>
        <p>Export payroll data and integrate with external systems</p>
      </div>

      <div className="integration-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="integration-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PayrollIntegration;




