import React, { useState } from 'react';
import './LabQualityClassifier.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const LabQualityClassifier = () => {
  const [formData, setFormData] = useState({
    drcPercentage: '',
    moistureContent: '',
    impurities: '',
    colorScore: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API}/api/knn/classify-quality`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          drcPercentage: Number(formData.drcPercentage),
          moistureContent: Number(formData.moistureContent),
          impurities: Number(formData.impurities),
          colorScore: Number(formData.colorScore)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.classification);
      } else {
        throw new Error(data.message || 'Classification failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to classify quality');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      drcPercentage: '',
      moistureContent: '',
      impurities: '',
      colorScore: ''
    });
    setResult(null);
    setError('');
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return '#10b981'; // Green
      case 'B': return '#3b82f6'; // Blue
      case 'C': return '#f59e0b'; // Orange
      case 'D': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getGradeDescription = (grade) => {
    switch(grade) {
      case 'A': return 'Excellent Quality - Premium Grade';
      case 'B': return 'Good Quality - Standard Grade';
      case 'C': return 'Fair Quality - Acceptable Grade';
      case 'D': return 'Poor Quality - Low Grade';
      default: return 'Unknown Grade';
    }
  };

  return (
    <div className="quality-classifier-container">
      <div className="classifier-header">
        <h2>🔬 AI Quality Classifier</h2>
        <p>Auto-classify material quality using K-Nearest Neighbors algorithm</p>
      </div>

      <div className="classifier-content">
        <form onSubmit={handleClassify} className="classifier-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="drcPercentage">
                <span className="label-icon">📊</span>
                DRC Percentage (%)
              </label>
              <input
                type="number"
                id="drcPercentage"
                name="drcPercentage"
                value={formData.drcPercentage}
                onChange={handleChange}
                placeholder="e.g., 32.5"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <span className="field-hint">Range: 0-100%</span>
            </div>

            <div className="form-field">
              <label htmlFor="moistureContent">
                <span className="label-icon">💧</span>
                Moisture Content (%)
              </label>
              <input
                type="number"
                id="moistureContent"
                name="moistureContent"
                value={formData.moistureContent}
                onChange={handleChange}
                placeholder="e.g., 2.1"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <span className="field-hint">Range: 0-100%</span>
            </div>

            <div className="form-field">
              <label htmlFor="impurities">
                <span className="label-icon">🧪</span>
                Impurities (%)
              </label>
              <input
                type="number"
                id="impurities"
                name="impurities"
                value={formData.impurities}
                onChange={handleChange}
                placeholder="e.g., 0.8"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <span className="field-hint">Range: 0-100%</span>
            </div>

            <div className="form-field">
              <label htmlFor="colorScore">
                <span className="label-icon">🎨</span>
                Color Score
              </label>
              <input
                type="number"
                id="colorScore"
                name="colorScore"
                value={formData.colorScore}
                onChange={handleChange}
                placeholder="e.g., 7.5"
                step="0.1"
                min="0"
                max="10"
                required
              />
              <span className="field-hint">Range: 0-10</span>
            </div>

          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-classify"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Classifying...
                </>
              ) : (
                <>
                  <span className="btn-icon">🤖</span>
                  Classify Quality
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={loading}
            >
              🔄 Reset
            </button>
          </div>
        </form>

        {result && (
          <div className="result-container">
            <div className="result-header">
              <h3>🎯 Classification Result</h3>
            </div>

            <div className="grade-display" style={{ borderColor: getGradeColor(result.qualityGrade) }}>
              <div className="grade-badge" style={{ background: getGradeColor(result.qualityGrade) }}>
                Grade {result.qualityGrade}
              </div>
              <div className="grade-description">
                {getGradeDescription(result.qualityGrade)}
              </div>
              <div className="confidence-bar-container">
                <div className="confidence-label">
                  <span>Confidence Level</span>
                  <span className="confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ 
                      width: `${result.confidence * 100}%`,
                      background: getGradeColor(result.qualityGrade)
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {result.neighbors && result.neighbors.length > 0 && (
              <div className="neighbors-section">
                <h4>📌 Similar Samples (K-Nearest Neighbors)</h4>
                <div className="neighbors-list">
                  {result.neighbors.slice(0, 3).map((neighbor, idx) => (
                    <div key={idx} className="neighbor-item">
                      <div className="neighbor-rank">#{idx + 1}</div>
                      <div className="neighbor-info">
                        <span className="neighbor-grade" style={{ color: getGradeColor(neighbor.grade) }}>
                          Grade {neighbor.grade}
                        </span>
                        <span className="neighbor-distance">
                          Distance: {neighbor.distance.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.modelInfo && (
              <div className="model-info">
                <h4>🔍 Model Information</h4>
                <div className="model-stats">
                  <div className="stat-item">
                    <span className="stat-label">K Value:</span>
                    <span className="stat-value">{result.modelInfo.k}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Training Samples:</span>
                    <span className="stat-value">{result.modelInfo.trainingSamples}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-section">
        <h4>ℹ️ How It Works</h4>
        <div className="info-content">
          <p>
            The Quality Classifier uses <strong>K-Nearest Neighbors (KNN)</strong> machine learning algorithm to predict quality grades based on your test parameters.
          </p>
          <ul>
            <li>✅ <strong>Grade A:</strong> DRC &gt; 30%, Low moisture, Minimal impurities</li>
            <li>✅ <strong>Grade B:</strong> DRC 25-30%, Moderate moisture, Low impurities</li>
            <li>✅ <strong>Grade C:</strong> DRC 20-25%, Higher moisture, Some impurities</li>
            <li>✅ <strong>Grade D:</strong> DRC &lt; 20%, High moisture, High impurities</li>
          </ul>
          <p className="info-note">
            <strong>Note:</strong> This is an AI prediction to assist decision-making. Final classification should be confirmed by lab staff.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabQualityClassifier;

