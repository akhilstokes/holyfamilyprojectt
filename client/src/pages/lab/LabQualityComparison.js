import React, { useState } from 'react';
import axios from 'axios';
import './LabQualityComparison.css';

const LabQualityComparison = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [inputs, setInputs] = useState({
    drcPercentage: '',
    moistureContent: '',
    impurities: '',
    colorScore: '',
    viscosity: ''
  });

  const [selectedAlgorithm, setSelectedAlgorithm] = useState('knn'); // 'knn', 'decision-tree', or 'both'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [knnResult, setKnnResult] = useState(null);
  const [dtResult, setDtResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const classifyQuality = async () => {
    setLoading(true);
    setError('');
    setKnnResult(null);
    setDtResult(null);

    try {
      const payload = {
        drcPercentage: Number(inputs.drcPercentage),
        moistureContent: Number(inputs.moistureContent),
        impurities: Number(inputs.impurities),
        colorScore: Number(inputs.colorScore),
        viscosity: Number(inputs.viscosity),
      };

      if (selectedAlgorithm === 'knn' || selectedAlgorithm === 'both') {
        const knnResponse = await axios.post(`${base}/api/knn/classify-quality`, payload, { headers: authHeaders() });
        if (knnResponse.data.success) {
          setKnnResult(knnResponse.data.classification);
        }
      }

      if (selectedAlgorithm === 'decision-tree' || selectedAlgorithm === 'both') {
        const dtResponse = await axios.post(`${base}/api/decision-tree/classify-quality`, payload, { headers: authHeaders() });
        if (dtResponse.data.success) {
          setDtResult(dtResponse.data.classification);
        }
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.response?.data?.message || 'Error classifying quality. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeIcon = (grade) => {
    const icons = { A: '🏆', B: '⭐', C: '📊', D: '📉' };
    return icons[grade] || '📋';
  };

  const getGradeDescription = (grade) => {
    const descriptions = {
      A: 'Excellent Quality',
      B: 'Good Quality',
      C: 'Average Quality',
      D: 'Below Average'
    };
    return descriptions[grade] || 'Quality Grade';
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: '#10b981',
      B: '#3b82f6',
      C: '#f59e0b',
      D: '#ef4444'
    };
    return colors[grade] || '#6b7280';
  };

  return (
    <div className="quality-comparison-container">
      <div className="page-header">
        <h2>🤖 AI Quality Classifier</h2>
        <p>Compare KNN vs Decision Tree algorithms for quality classification</p>
      </div>

      {/* Algorithm Selection */}
      <div className="algorithm-selector">
        <h3>Select Algorithm</h3>
        <div className="algorithm-options">
          <button
            className={`algo-btn ${selectedAlgorithm === 'knn' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('knn')}
          >
            <span className="algo-icon">🎯</span>
            <span>K-Nearest Neighbors</span>
          </button>
          <button
            className={`algo-btn ${selectedAlgorithm === 'decision-tree' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('decision-tree')}
          >
            <span className="algo-icon">🌳</span>
            <span>Decision Tree</span>
          </button>
          <button
            className={`algo-btn ${selectedAlgorithm === 'both' ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm('both')}
          >
            <span className="algo-icon">⚖️</span>
            <span>Compare Both</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="input-section">
        <h3>📊 Input Parameters</h3>
        <div className="input-grid">
          <div className="input-field">
            <label>📊 DRC Percentage (%)</label>
            <input
              type="number"
              name="drcPercentage"
              value={inputs.drcPercentage}
              onChange={handleInputChange}
              placeholder="e.g., 60"
              min="0"
              max="100"
              step="0.1"
            />
            <small>Range: 0-100%</small>
          </div>

          <div className="input-field">
            <label>💧 Moisture Content (%)</label>
            <input
              type="number"
              name="moistureContent"
              value={inputs.moistureContent}
              onChange={handleInputChange}
              placeholder="e.g., 0.5"
              min="0"
              max="100"
              step="0.1"
            />
            <small>Range: 0-100%</small>
          </div>

          <div className="input-field">
            <label>🧪 Impurities (%)</label>
            <input
              type="number"
              name="impurities"
              value={inputs.impurities}
              onChange={handleInputChange}
              placeholder="e.g., 1.0"
              min="0"
              max="100"
              step="0.1"
            />
            <small>Range: 0-100%</small>
          </div>

          <div className="input-field">
            <label>🎨 Color Score</label>
            <input
              type="number"
              name="colorScore"
              value={inputs.colorScore}
              onChange={handleInputChange}
              placeholder="e.g., 7"
              min="0"
              max="10"
              step="0.1"
            />
            <small>Range: 0-10</small>
          </div>

          <div className="input-field">
            <label>💧 Viscosity (cP)</label>
            <input
              type="number"
              name="viscosity"
              value={inputs.viscosity}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              min="0"
              step="0.1"
            />
            <small>Centipoise units</small>
          </div>
        </div>

        <button
          className="classify-btn"
          onClick={classifyQuality}
          disabled={loading || !inputs.drcPercentage || !inputs.moistureContent}
        >
          {loading ? '🔄 Classifying...' : '🎯 Classify Quality'}
        </button>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {/* Results Section */}
      <div className="results-section">
        {/* KNN Result */}
        {knnResult && (
          <div className="result-card knn-result">
            <div className="result-header">
              <h3>🎯 K-Nearest Neighbors Result</h3>
            </div>
            <div className="grade-badge" style={{ background: `linear-gradient(135deg, ${getGradeColor(knnResult.qualityGrade)}, ${getGradeColor(knnResult.qualityGrade)}dd)` }}>
              <span className="grade-icon">{getGradeIcon(knnResult.qualityGrade)}</span>
              <span className="grade-text">Grade {knnResult.qualityGrade}</span>
              <span className="grade-desc">{getGradeDescription(knnResult.qualityGrade)}</span>
            </div>

            <div className="confidence-section">
              <div className="confidence-label">Confidence</div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${(knnResult.confidence * 100).toFixed(0)}%`, background: getGradeColor(knnResult.qualityGrade) }}
                ></div>
              </div>
              <div className="confidence-value">{(knnResult.confidence * 100).toFixed(1)}%</div>
            </div>

            {knnResult.neighbors && knnResult.neighbors.length > 0 && (
              <div className="neighbors-section">
                <h4>📌 Nearest Neighbors:</h4>
                <div className="neighbors-list">
                  {knnResult.neighbors.map((n, idx) => (
                    <div key={idx} className="neighbor-item">
                      <span className="neighbor-number">#{idx + 1}</span>
                      <span className="neighbor-grade">Grade {n.grade}</span>
                      <span className="neighbor-distance">Distance: {n.distance.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="model-info">
              🔍 K={knnResult.modelInfo.k} | {knnResult.modelInfo.trainingSamples} training samples
            </div>
          </div>
        )}

        {/* Decision Tree Result */}
        {dtResult && (
          <div className="result-card dt-result">
            <div className="result-header">
              <h3>🌳 Decision Tree Result</h3>
            </div>
            <div className="grade-badge" style={{ background: `linear-gradient(135deg, ${getGradeColor(dtResult.qualityGrade)}, ${getGradeColor(dtResult.qualityGrade)}dd)` }}>
              <span className="grade-icon">{getGradeIcon(dtResult.qualityGrade)}</span>
              <span className="grade-text">Grade {dtResult.qualityGrade}</span>
              <span className="grade-desc">{getGradeDescription(dtResult.qualityGrade)}</span>
            </div>

            <div className="confidence-section">
              <div className="confidence-label">Confidence</div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${(dtResult.confidence * 100).toFixed(0)}%`, background: getGradeColor(dtResult.qualityGrade) }}
                ></div>
              </div>
              <div className="confidence-value">{(dtResult.confidence * 100).toFixed(1)}%</div>
            </div>

            {dtResult.decisionPath && dtResult.decisionPath.length > 0 && (
              <div className="decision-path-section">
                <h4>🌳 Decision Path:</h4>
                <div className="decision-tree">
                  {dtResult.decisionPath.map((step, idx) => (
                    <div key={idx} className="decision-step">
                      <div className="step-number">{idx + 1}</div>
                      <div className="step-content">
                        <div className="step-feature">{step.feature}</div>
                        <div className="step-comparison">
                          {step.value.toFixed(2)} {step.comparison} {step.threshold.toFixed(2)}
                        </div>
                        <div className="step-arrow">→ {step.decision === 'left' ? 'Left Branch' : 'Right Branch'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="model-info">
              🔍 Max Depth: 5 | {dtResult.modelInfo.trainingSamples} training samples
            </div>
          </div>
        )}

        {/* Comparison Summary */}
        {knnResult && dtResult && (
          <div className="comparison-summary">
            <h3>⚖️ Algorithm Comparison</h3>
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>K-NN</th>
                    <th>Decision Tree</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prediction</td>
                    <td>
                      <span className="grade-pill" style={{ background: getGradeColor(knnResult.qualityGrade) }}>
                        Grade {knnResult.qualityGrade}
                      </span>
                    </td>
                    <td>
                      <span className="grade-pill" style={{ background: getGradeColor(dtResult.qualityGrade) }}>
                        Grade {dtResult.qualityGrade}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Confidence</td>
                    <td>{(knnResult.confidence * 100).toFixed(1)}%</td>
                    <td>{(dtResult.confidence * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>Agreement</td>
                    <td colSpan="2" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {knnResult.qualityGrade === dtResult.qualityGrade ? (
                        <span style={{ color: '#10b981' }}>✅ Both Agree</span>
                      ) : (
                        <span style={{ color: '#f59e0b' }}>⚠️ Different Results</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabQualityComparison;

