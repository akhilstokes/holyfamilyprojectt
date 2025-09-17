import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdvancedAnalytics.css';

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    overview: null,
    trends: null,
    predictions: null,
    insights: null
  });

  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, activeTab]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        overview: '/api/admin/analytics/overview',
        trends: '/api/admin/analytics/trends',
        predictions: '/api/admin/analytics/predictions',
        insights: '/api/admin/analytics/insights'
      };

      const response = await fetch(`${base}${endpoints[activeTab]}?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(prev => ({ ...prev, [activeTab]: result.data }));
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
    { id: 'trends', label: 'Trends', icon: 'fas fa-chart-line' },
    { id: 'predictions', label: 'Predictions', icon: 'fas fa-crystal-ball' },
    { id: 'insights', label: 'Insights', icon: 'fas fa-lightbulb' }
  ];

  const renderOverviewTab = () => {
    const overview = analytics.overview;
    if (!overview) return <div className="loading">Loading overview analytics...</div>;

    return (
      <div className="analytics-overview">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="kpi-content">
              <h3>{overview.totalStaff || 0}</h3>
              <p>Total Staff</p>
              <div className="kpi-trend">
                <span className={`trend ${overview.staffTrend > 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-arrow-${overview.staffTrend > 0 ? 'up' : 'down'}`}></i>
                  {Math.abs(overview.staffTrend)}%
                </span>
                <span className="trend-label">vs last period</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="kpi-content">
              <h3>{overview.avgAttendance || 0}%</h3>
              <p>Avg Attendance</p>
              <div className="kpi-trend">
                <span className={`trend ${overview.attendanceTrend > 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-arrow-${overview.attendanceTrend > 0 ? 'up' : 'down'}`}></i>
                  {Math.abs(overview.attendanceTrend)}%
                </span>
                <span className="trend-label">vs last period</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="kpi-content">
              <h3>{overview.productivity || 0}%</h3>
              <p>Productivity</p>
              <div className="kpi-trend">
                <span className={`trend ${overview.productivityTrend > 0 ? 'positive' : 'negative'}`}>
                  <i className={`fas fa-arrow-${overview.productivityTrend > 0 ? 'up' : 'down'}`}></i>
                  {Math.abs(overview.productivityTrend)}%
                </span>
                <span className="trend-label">vs last period</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="kpi-content">
              <h3>₹{overview.totalCost || 0}</h3>
              <p>Total Cost</p>
              <div className="kpi-trend">
                <span className={`trend ${overview.costTrend > 0 ? 'negative' : 'positive'}`}>
                  <i className={`fas fa-arrow-${overview.costTrend > 0 ? 'up' : 'down'}`}></i>
                  {Math.abs(overview.costTrend)}%
                </span>
                <span className="trend-label">vs last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h4>Performance Distribution</h4>
            <div className="performance-chart">
              <div className="performance-bar">
                <div className="bar-segment excellent" style={{ width: `${overview.excellent || 0}%` }}>
                  <span>Excellent ({overview.excellent || 0}%)</span>
                </div>
                <div className="bar-segment good" style={{ width: `${overview.good || 0}%` }}>
                  <span>Good ({overview.good || 0}%)</span>
                </div>
                <div className="bar-segment average" style={{ width: `${overview.average || 0}%` }}>
                  <span>Average ({overview.average || 0}%)</span>
                </div>
                <div className="bar-segment poor" style={{ width: `${overview.poor || 0}%` }}>
                  <span>Poor ({overview.poor || 0}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h4>Cost Breakdown</h4>
            <div className="cost-breakdown">
              <div className="cost-item">
                <span className="cost-label">Daily Wages</span>
                <span className="cost-value">₹{overview.dailyWages || 0}</span>
                <div className="cost-bar">
                  <div className="cost-fill" style={{ width: `${(overview.dailyWages / overview.totalCost) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div className="cost-item">
                <span className="cost-label">Monthly Salaries</span>
                <span className="cost-value">₹{overview.monthlySalaries || 0}</span>
                <div className="cost-bar">
                  <div className="cost-fill" style={{ width: `${(overview.monthlySalaries / overview.totalCost) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div className="cost-item">
                <span className="cost-label">Overtime</span>
                <span className="cost-value">₹{overview.overtime || 0}</span>
                <div className="cost-bar">
                  <div className="cost-fill" style={{ width: `${(overview.overtime / overview.totalCost) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    const trends = analytics.trends;
    if (!trends) return <div className="loading">Loading trends data...</div>;

    return (
      <div className="trends-section">
        <div className="trends-grid">
          <div className="trend-card">
            <h4>Attendance Trend</h4>
            <div className="trend-chart">
              <div className="chart-placeholder">
                <i className="fas fa-chart-line"></i>
                <p>Attendance trend over time</p>
              </div>
            </div>
            <div className="trend-summary">
              <div className="trend-item">
                <span className="label">Peak Day:</span>
                <span className="value">{trends.peakDay || 'Monday'}</span>
              </div>
              <div className="trend-item">
                <span className="label">Lowest Day:</span>
                <span className="value">{trends.lowestDay || 'Friday'}</span>
              </div>
            </div>
          </div>

          <div className="trend-card">
            <h4>Productivity Trend</h4>
            <div className="trend-chart">
              <div className="chart-placeholder">
                <i className="fas fa-chart-area"></i>
                <p>Productivity trend over time</p>
              </div>
            </div>
            <div className="trend-summary">
              <div className="trend-item">
                <span className="label">Best Month:</span>
                <span className="value">{trends.bestMonth || 'March'}</span>
              </div>
              <div className="trend-item">
                <span className="label">Growth Rate:</span>
                <span className="value">{trends.growthRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="trend-card">
            <h4>Cost Trend</h4>
            <div className="trend-chart">
              <div className="chart-placeholder">
                <i className="fas fa-chart-bar"></i>
                <p>Cost trend over time</p>
              </div>
            </div>
            <div className="trend-summary">
              <div className="trend-item">
                <span className="label">Avg Monthly Cost:</span>
                <span className="value">₹{trends.avgMonthlyCost || 0}</span>
              </div>
              <div className="trend-item">
                <span className="label">Cost per Employee:</span>
                <span className="value">₹{trends.costPerEmployee || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPredictionsTab = () => {
    const predictions = analytics.predictions;
    if (!predictions) return <div className="loading">Loading predictions...</div>;

    return (
      <div className="predictions-section">
        <div className="predictions-grid">
          <div className="prediction-card">
            <h4>Next Month Forecast</h4>
            <div className="prediction-content">
              <div className="prediction-item">
                <span className="label">Expected Attendance:</span>
                <span className="value">{predictions.expectedAttendance || 0}%</span>
              </div>
              <div className="prediction-item">
                <span className="label">Expected Productivity:</span>
                <span className="value">{predictions.expectedProductivity || 0}%</span>
              </div>
              <div className="prediction-item">
                <span className="label">Expected Cost:</span>
                <span className="value">₹{predictions.expectedCost || 0}</span>
              </div>
            </div>
            <div className="confidence-level">
              <span className="confidence-label">Confidence:</span>
              <span className="confidence-value">{predictions.confidence || 0}%</span>
            </div>
          </div>

          <div className="prediction-card">
            <h4>Risk Factors</h4>
            <div className="risk-factors">
              {predictions.riskFactors?.map((risk, index) => (
                <div key={index} className="risk-item">
                  <div className="risk-icon">
                    <i className={`fas fa-${risk.severity === 'high' ? 'exclamation-triangle' : risk.severity === 'medium' ? 'exclamation-circle' : 'info-circle'}`}></i>
                  </div>
                  <div className="risk-content">
                    <div className="risk-title">{risk.title}</div>
                    <div className="risk-description">{risk.description}</div>
                  </div>
                  <div className={`risk-severity ${risk.severity}`}>
                    {risk.severity}
                  </div>
                </div>
              )) || (
                <div className="no-risks">
                  <i className="fas fa-check-circle"></i>
                  <p>No significant risk factors identified</p>
                </div>
              )}
            </div>
          </div>

          <div className="prediction-card">
            <h4>Optimization Opportunities</h4>
            <div className="optimization-opportunities">
              {predictions.opportunities?.map((opportunity, index) => (
                <div key={index} className="opportunity-item">
                  <div className="opportunity-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="opportunity-content">
                    <div className="opportunity-title">{opportunity.title}</div>
                    <div className="opportunity-description">{opportunity.description}</div>
                    <div className="opportunity-impact">
                      Potential Impact: {opportunity.impact}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="no-opportunities">
                  <i className="fas fa-search"></i>
                  <p>No optimization opportunities found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsightsTab = () => {
    const insights = analytics.insights;
    if (!insights) return <div className="loading">Loading insights...</div>;

    return (
      <div className="insights-section">
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Key Insights</h4>
            <div className="insights-list">
              {insights.keyInsights?.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">
                    <i className="fas fa-eye"></i>
                  </div>
                  <div className="insight-content">
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-description">{insight.description}</div>
                  </div>
                </div>
              )) || (
                <div className="no-insights">
                  <i className="fas fa-info-circle"></i>
                  <p>No insights available for this period</p>
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <h4>Recommendations</h4>
            <div className="recommendations-list">
              {insights.recommendations?.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-icon">
                    <i className="fas fa-thumbs-up"></i>
                  </div>
                  <div className="recommendation-content">
                    <div className="recommendation-title">{recommendation.title}</div>
                    <div className="recommendation-description">{recommendation.description}</div>
                    <div className="recommendation-priority">
                      Priority: <span className={`priority ${recommendation.priority}`}>{recommendation.priority}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="no-recommendations">
                  <i className="fas fa-check"></i>
                  <p>No recommendations at this time</p>
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <h4>Performance Alerts</h4>
            <div className="alerts-list">
              {insights.alerts?.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    <i className={`fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : alert.type === 'error' ? 'times-circle' : 'info-circle'}`}></i>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-description">{alert.description}</div>
                    <div className="alert-time">{alert.timestamp}</div>
                  </div>
                </div>
              )) || (
                <div className="no-alerts">
                  <i className="fas fa-shield-alt"></i>
                  <p>No alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'trends':
        return renderTrendsTab();
      case 'predictions':
        return renderPredictionsTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return <div>Select a tab to view analytics</div>;
    }
  };

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h2>Advanced Analytics & Insights</h2>
        <div className="header-controls">
          <div className="date-range">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
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

      <div className="analytics-content">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Loading analytics data...
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;




