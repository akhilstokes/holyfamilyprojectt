import React, { useState } from 'react';
import axios from 'axios';

const KNNPredictor = () => {
  const [activeTab, setActiveTab] = useState('price');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Form states for different KNN models
  const [priceForm, setPriceForm] = useState({
    volume: '',
    qualityScore: '',
    seasonFactor: '',
    demandFactor: '',
    historicalPrice: ''
  });

  const [qualityForm, setQualityForm] = useState({
    drcPercentage: '',
    moistureContent: '',
    impurities: '',
    colorScore: '',
    viscosity: ''
  });

  const [demandForm, setDemandForm] = useState({
    dayOfWeek: '',
    month: '',
    seasonFactor: '',
    weatherFactor: '',
    marketTrend: '',
    historicalDemand: ''
  });

  const [anomalyForm, setAnomalyForm] = useState({
    transactionAmount: '',
    timeOfDay: '',
    locationFactor: '',
    userBehaviorScore: '',
    frequency: ''
  });

  const token = localStorage.getItem('token');
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      let endpoint = '';
      let data = {};

      switch (activeTab) {
        case 'price':
          endpoint = '/api/knn/predict-price';
          data = priceForm;
          break;
        case 'quality':
          endpoint = '/api/knn/classify-quality';
          data = qualityForm;
          break;
        case 'demand':
          endpoint = '/api/knn/forecast-demand';
          data = demandForm;
          break;
        case 'anomaly':
          endpoint = '/api/knn/detect-anomaly';
          data = anomalyForm;
          break;
        default:
          throw new Error('Invalid tab selected');
      }

      const response = await axios.post(`${baseURL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderPriceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Volume (kg)
        </label>
        <input
          type="number"
          value={priceForm.volume}
          onChange={(e) => setPriceForm({...priceForm, volume: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter volume in kg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality Score (DRC %)
        </label>
        <input
          type="number"
          value={priceForm.qualityScore}
          onChange={(e) => setPriceForm({...priceForm, qualityScore: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter DRC percentage"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Season Factor (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          value={priceForm.seasonFactor}
          onChange={(e) => setPriceForm({...priceForm, seasonFactor: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1.0 = normal season"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Demand Factor (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          value={priceForm.demandFactor}
          onChange={(e) => setPriceForm({...priceForm, demandFactor: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1.0 = normal demand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Historical Price (Optional)
        </label>
        <input
          type="number"
          value={priceForm.historicalPrice}
          onChange={(e) => setPriceForm({...priceForm, historicalPrice: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Previous price reference"
        />
      </div>
    </div>
  );

  const renderQualityForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          DRC Percentage
        </label>
        <input
          type="number"
          value={qualityForm.drcPercentage}
          onChange={(e) => setQualityForm({...qualityForm, drcPercentage: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter DRC percentage"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Moisture Content (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          value={qualityForm.moistureContent}
          onChange={(e) => setQualityForm({...qualityForm, moistureContent: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Moisture percentage"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Impurities (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          value={qualityForm.impurities}
          onChange={(e) => setQualityForm({...qualityForm, impurities: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Impurity percentage"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color Score (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          value={qualityForm.colorScore}
          onChange={(e) => setQualityForm({...qualityForm, colorScore: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Color score (1-10)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Viscosity (Optional)
        </label>
        <input
          type="number"
          value={qualityForm.viscosity}
          onChange={(e) => setQualityForm({...qualityForm, viscosity: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Viscosity measurement"
        />
      </div>
    </div>
  );

  const renderDemandForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Day of Week
        </label>
        <select
          value={demandForm.dayOfWeek}
          onChange={(e) => setDemandForm({...demandForm, dayOfWeek: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select day</option>
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Month
        </label>
        <select
          value={demandForm.month}
          onChange={(e) => setDemandForm({...demandForm, month: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select month</option>
          {Array.from({length: 12}, (_, i) => (
            <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Historical Demand (Optional)
        </label>
        <input
          type="number"
          value={demandForm.historicalDemand}
          onChange={(e) => setDemandForm({...demandForm, historicalDemand: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Previous demand volume"
        />
      </div>
    </div>
  );

  const renderAnomalyForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction Amount
        </label>
        <input
          type="number"
          value={anomalyForm.transactionAmount}
          onChange={(e) => setAnomalyForm({...anomalyForm, transactionAmount: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Transaction amount"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time of Day (Hour)
        </label>
        <input
          type="number"
          min="0"
          max="23"
          value={anomalyForm.timeOfDay}
          onChange={(e) => setAnomalyForm({...anomalyForm, timeOfDay: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0-23"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Behavior Score (Optional)
        </label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={anomalyForm.userBehaviorScore}
          onChange={(e) => setAnomalyForm({...anomalyForm, userBehaviorScore: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Behavior score (0-10)"
        />
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const getResultContent = () => {
      switch (activeTab) {
        case 'price':
          return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Price Prediction</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Predicted Price:</span> ₹{results.prediction.predictedPrice}</p>
                <p><span className="font-medium">Confidence:</span> {(results.prediction.confidence * 100).toFixed(1)}%</p>
                <p><span className="font-medium">Model Info:</span> K={results.prediction.modelInfo.k}, Training Samples: {results.prediction.modelInfo.trainingSamples}</p>
              </div>
            </div>
          );
        case 'quality':
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Quality Classification</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Quality Grade:</span> <span className="font-bold text-lg">{results.classification.qualityGrade}</span></p>
                <p><span className="font-medium">Confidence:</span> {(results.classification.confidence * 100).toFixed(1)}%</p>
                <p><span className="font-medium">Model Info:</span> K={results.classification.modelInfo.k}, Training Samples: {results.classification.modelInfo.trainingSamples}</p>
              </div>
            </div>
          );
        case 'demand':
          return (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Demand Forecast</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Predicted Demand:</span> {results.forecast.predictedDemand} kg</p>
                <p><span className="font-medium">Confidence:</span> {(results.forecast.confidence * 100).toFixed(1)}%</p>
                <p><span className="font-medium">Model Info:</span> K={results.forecast.modelInfo.k}, Training Samples: {results.forecast.modelInfo.trainingSamples}</p>
              </div>
            </div>
          );
        case 'anomaly':
          return (
            <div className={`border rounded-lg p-4 ${results.anomalyDetection.isAnomaly ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${results.anomalyDetection.isAnomaly ? 'text-red-800' : 'text-green-800'}`}>
                Anomaly Detection
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-bold ${
                    results.anomalyDetection.isAnomaly ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {results.anomalyDetection.isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL'}
                  </span>
                </p>
                <p><span className="font-medium">Risk Level:</span> {results.anomalyDetection.riskLevel}</p>
                <p><span className="font-medium">Anomaly Score:</span> {results.anomalyDetection.anomalyScore}</p>
                <p><span className="font-medium">Confidence:</span> {(results.anomalyDetection.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="mt-6">
        {getResultContent()}
      </div>
    );
  };

  const tabs = [
    { id: 'price', label: 'Price Prediction', description: 'Predict material prices using historical data' },
    { id: 'quality', label: 'Quality Classification', description: 'Classify material quality grades' },
    { id: 'demand', label: 'Demand Forecasting', description: 'Forecast future demand patterns' },
    { id: 'anomaly', label: 'Anomaly Detection', description: 'Detect unusual transaction patterns' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KNN Algorithm Predictor</h1>
          <p className="text-gray-600">Machine Learning-powered predictions for Holy Family Polymers</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === 'price' && renderPriceForm()}
              {activeTab === 'quality' && renderQualityForm()}
              {activeTab === 'demand' && renderDemandForm()}
              {activeTab === 'anomaly' && renderAnomalyForm()}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Predict'}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {renderResults()}
        </div>
      </div>
    </div>
  );
};

export default KNNPredictor;
