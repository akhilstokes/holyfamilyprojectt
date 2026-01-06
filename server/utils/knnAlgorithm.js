/**
 * K-Nearest Neighbors (KNN) Algorithm Implementation
 * For Holy Family Polymers Project
 * 
 * This module provides KNN implementations for various business use cases:
 * 1. Price Prediction based on historical data
 * 2. Quality Classification for materials
 * 3. Demand Forecasting
 * 4. Customer Segmentation
 * 5. Anomaly Detection
 */

class KNNAlgorithm {
  constructor(k = 3, distanceMetric = 'euclidean') {
    this.k = k;
    this.distanceMetric = distanceMetric;
    this.trainingData = [];
    this.features = [];
    this.labels = [];
    this.minMaxValues = []; // Store min/max for normalization
    this.isNormalized = false;
  }

  /**
   * Calculate distance between two data points
   * @param {Array} point1 - First data point
   * @param {Array} point2 - Second data point
   * @returns {number} Distance between points
   */
  calculateDistance(point1, point2) {
    if (point1.length !== point2.length) {
      throw new Error('Data points must have the same number of features');
    }

    switch (this.distanceMetric) {
      case 'euclidean':
        return Math.sqrt(
          point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
        );
      
      case 'manhattan':
        return point1.reduce((sum, val, i) => sum + Math.abs(val - point2[i]), 0);
      
      case 'minkowski':
        const p = 3; // Minkowski parameter
        return Math.pow(
          point1.reduce((sum, val, i) => sum + Math.pow(Math.abs(val - point2[i]), p), 0),
          1/p
        );
      
      default:
        throw new Error('Unsupported distance metric');
    }
  }

  /**
   * Normalize features to prevent scale bias
   * @param {Array} data - Training data
   * @param {boolean} saveMinMax - Whether to save min/max values for later use
   * @returns {Array} Normalized data
   */
  normalizeFeatures(data, saveMinMax = false) {
    if (data.length === 0) return data;
    
    const numFeatures = data[0].length;
    const normalized = [];
    
    // Calculate min and max for each feature
    const minMax = [];
    for (let i = 0; i < numFeatures; i++) {
      const values = data.map(point => point[i]);
      minMax.push({
        min: Math.min(...values),
        max: Math.max(...values)
      });
    }
    
    // Save min/max values if requested (for use during prediction)
    if (saveMinMax) {
      this.minMaxValues = minMax;
    }
    
    // Normalize each data point
    for (const point of data) {
      const normalizedPoint = point.map((value, i) => {
        const { min, max } = minMax[i];
        return max === min ? 0 : (value - min) / (max - min);
      });
      normalized.push(normalizedPoint);
    }
    
    return normalized;
  }

  /**
   * Train the KNN model
   * @param {Array} features - Feature vectors
   * @param {Array} labels - Corresponding labels/targets
   * @param {boolean} normalize - Whether to normalize features
   */
  train(features, labels, normalize = true) {
    if (features.length !== labels.length) {
      throw new Error('Features and labels must have the same length');
    }

    this.isNormalized = normalize;
    this.features = normalize ? this.normalizeFeatures(features, true) : features;
    this.labels = labels;
    this.trainingData = this.features.map((feature, index) => ({
      features: feature,
      label: labels[index]
    }));
  }

  /**
   * Predict the label for a new data point
   * @param {Array} testPoint - Data point to classify
   * @param {boolean} normalize - Whether to normalize the test point
   * @returns {Object} Prediction result with label and confidence
   */
  predict(testPoint, normalize = true) {
    if (this.trainingData.length === 0) {
      throw new Error('Model must be trained before making predictions');
    }

    if (testPoint.length !== this.features[0].length) {
      throw new Error('Test point must have the same number of features as training data');
    }

    // Normalize test point if needed using saved min/max values from training
    let normalizedTestPoint = testPoint;
    if (normalize && this.isNormalized && this.minMaxValues.length > 0) {
      normalizedTestPoint = testPoint.map((value, i) => {
        const { min, max } = this.minMaxValues[i];
        return max === min ? 0 : (value - min) / (max - min);
      });
    }

    // Calculate distances to all training points
    const distances = this.trainingData.map(({ features, label }) => ({
      distance: this.calculateDistance(normalizedTestPoint, features),
      label: label
    }));

    // Sort by distance and get k nearest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, this.k);

    // Count votes for each label
    const labelVotes = {};
    kNearest.forEach(({ label }) => {
      labelVotes[label] = (labelVotes[label] || 0) + 1;
    });

    // Find the most common label
    const predictedLabel = Object.keys(labelVotes).reduce((a, b) => 
      labelVotes[a] > labelVotes[b] ? a : b
    );

    // Calculate confidence (proportion of votes for predicted label)
    const confidence = labelVotes[predictedLabel] / this.k;

    return {
      label: predictedLabel,
      confidence: confidence,
      neighbors: kNearest,
      allVotes: labelVotes
    };
  }

  /**
   * Predict multiple data points
   * @param {Array} testPoints - Array of data points to classify
   * @returns {Array} Array of prediction results
   */
  predictBatch(testPoints) {
    return testPoints.map(point => this.predict(point));
  }

  /**
   * Calculate model accuracy on test data
   * @param {Array} testFeatures - Test feature vectors
   * @param {Array} testLabels - True labels for test data
   * @returns {number} Accuracy score (0-1)
   */
  evaluate(testFeatures, testLabels) {
    if (testFeatures.length !== testLabels.length) {
      throw new Error('Test features and labels must have the same length');
    }

    let correctPredictions = 0;
    const predictions = this.predictBatch(testFeatures);

    predictions.forEach((prediction, index) => {
      if (prediction.label === testLabels[index]) {
        correctPredictions++;
      }
    });

    return correctPredictions / testFeatures.length;
  }

  /**
   * Find optimal k value using cross-validation
   * @param {Array} features - Feature vectors
   * @param {Array} labels - Labels
   * @param {number} maxK - Maximum k to test
   * @param {number} folds - Number of cross-validation folds
   * @returns {Object} Best k value and accuracy
   */
  findOptimalK(features, labels, maxK = 10, folds = 5) {
    const kValues = Array.from({ length: maxK - 1 }, (_, i) => i + 1);
    const results = [];

    for (const k of kValues) {
      this.k = k;
      const accuracies = [];

      // Cross-validation
      for (let fold = 0; fold < folds; fold++) {
        const foldSize = Math.floor(features.length / folds);
        const start = fold * foldSize;
        const end = start + foldSize;

        const testFeatures = features.slice(start, end);
        const testLabels = labels.slice(start, end);
        const trainFeatures = [...features.slice(0, start), ...features.slice(end)];
        const trainLabels = [...labels.slice(0, start), ...labels.slice(end)];

        this.train(trainFeatures, trainLabels);
        const accuracy = this.evaluate(testFeatures, testLabels);
        accuracies.push(accuracy);
      }

      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      results.push({ k, accuracy: avgAccuracy });
    }

    const bestResult = results.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );

    return bestResult;
  }
}

/**
 * Specialized KNN implementations for specific business use cases
 */

class PricePredictionKNN extends KNNAlgorithm {
  constructor(k = 5) {
    super(k, 'euclidean');
  }

  /**
   * Train model for price prediction
   * Features: [volume, quality_score, season_factor, demand_factor, historical_price]
   * Labels: price categories or actual prices
   */
  trainPriceModel(historicalData) {
    const features = historicalData.map(record => [
      record.volume || 0,
      record.qualityScore || 0,
      record.seasonFactor || 0,
      record.demandFactor || 0,
      record.historicalPrice || 0
    ]);
    
    const labels = historicalData.map(record => record.price);
    
    this.train(features, labels);
  }

  /**
   * Predict price for new data point
   */
  predictPrice(volume, qualityScore, seasonFactor, demandFactor, historicalPrice) {
    const testPoint = [volume, qualityScore, seasonFactor, demandFactor, historicalPrice];
    return this.predict(testPoint);
  }
}

class QualityClassificationKNN extends KNNAlgorithm {
  constructor(k = 3) {
    super(k, 'euclidean');
  }

  /**
   * Train model for quality classification
   * Features: [drc_percentage, moisture_content, impurities, color_score, viscosity]
   * Labels: quality categories (A, B, C, D)
   */
  trainQualityModel(qualityData) {
    const features = qualityData.map(record => [
      record.drcPercentage || 0,
      record.moistureContent || 0,
      record.impurities || 0,
      record.colorScore || 0,
      record.viscosity || 0
    ]);
    
    const labels = qualityData.map(record => record.qualityGrade);
    
    this.train(features, labels);
  }

  /**
   * Classify quality of new sample
   */
  classifyQuality(drcPercentage, moistureContent, impurities, colorScore, viscosity) {
    const testPoint = [drcPercentage, moistureContent, impurities, colorScore, viscosity];
    return this.predict(testPoint);
  }
}

class DemandForecastingKNN extends KNNAlgorithm {
  constructor(k = 7) {
    super(k, 'euclidean');
  }

  /**
   * Train model for demand forecasting
   * Features: [day_of_week, month, season, weather_factor, market_trend, historical_demand]
   * Labels: demand categories or actual demand values
   */
  trainDemandModel(demandData) {
    const features = demandData.map(record => [
      record.dayOfWeek || 0,
      record.month || 0,
      record.seasonFactor || 0,
      record.weatherFactor || 0,
      record.marketTrend || 0,
      record.historicalDemand || 0
    ]);
    
    const labels = demandData.map(record => record.demand);
    
    this.train(features, labels);
  }

  /**
   * Forecast demand for specific conditions
   */
  forecastDemand(dayOfWeek, month, seasonFactor, weatherFactor, marketTrend, historicalDemand) {
    const testPoint = [dayOfWeek, month, seasonFactor, weatherFactor, marketTrend, historicalDemand];
    return this.predict(testPoint);
  }
}

class CustomerSegmentationKNN extends KNNAlgorithm {
  constructor(k = 5) {
    super(k, 'euclidean');
  }

  /**
   * Train model for customer segmentation
   * Features: [purchase_frequency, avg_order_value, loyalty_score, location_factor, seasonality]
   * Labels: customer segments (VIP, Regular, New, At-Risk)
   */
  trainCustomerModel(customerData) {
    const features = customerData.map(record => [
      record.purchaseFrequency || 0,
      record.avgOrderValue || 0,
      record.loyaltyScore || 0,
      record.locationFactor || 0,
      record.seasonality || 0
    ]);
    
    const labels = customerData.map(record => record.segment);
    
    this.train(features, labels);
  }

  /**
   * Segment new customer
   */
  segmentCustomer(purchaseFrequency, avgOrderValue, loyaltyScore, locationFactor, seasonality) {
    const testPoint = [purchaseFrequency, avgOrderValue, loyaltyScore, locationFactor, seasonality];
    return this.predict(testPoint);
  }
}

class AnomalyDetectionKNN extends KNNAlgorithm {
  constructor(k = 5, threshold = 0.3) {
    super(k, 'euclidean');
    this.threshold = threshold;
  }

  /**
   * Train model for anomaly detection
   * Features: [transaction_amount, time_of_day, location_factor, user_behavior_score, frequency]
   * Labels: normal/abnormal (though we'll use distance-based detection)
   */
  trainAnomalyModel(normalData) {
    const features = normalData.map(record => [
      record.transactionAmount || 0,
      record.timeOfDay || 0,
      record.locationFactor || 0,
      record.userBehaviorScore || 0,
      record.frequency || 0
    ]);
    
    // For anomaly detection, we don't need labels, just train on normal data
    this.features = this.normalizeFeatures(features);
    this.trainingData = this.features.map(feature => ({ features: feature }));
  }

  /**
   * Detect if a data point is anomalous
   */
  detectAnomaly(transactionAmount, timeOfDay, locationFactor, userBehaviorScore, frequency) {
    const testPoint = [transactionAmount, timeOfDay, locationFactor, userBehaviorScore, frequency];
    
    // Normalize test point
    const numFeatures = testPoint.length;
    const minMax = [];
    
    for (let i = 0; i < numFeatures; i++) {
      const values = this.features.map(point => point[i]);
      minMax.push({
        min: Math.min(...values),
        max: Math.max(...values)
      });
    }
    
    const normalizedTestPoint = testPoint.map((value, i) => {
      const { min, max } = minMax[i];
      return max === min ? 0 : (value - min) / (max - min);
    });

    // Calculate distances to all training points
    const distances = this.trainingData.map(({ features }) => 
      this.calculateDistance(normalizedTestPoint, features)
    );

    // Sort distances and get k nearest neighbors
    distances.sort((a, b) => a - b);
    const kNearestDistances = distances.slice(0, this.k);

    // Calculate average distance to k nearest neighbors
    const avgDistance = kNearestDistances.reduce((sum, dist) => sum + dist, 0) / this.k;

    // Determine if anomalous based on threshold
    const isAnomaly = avgDistance > this.threshold;

    return {
      isAnomaly: isAnomaly,
      anomalyScore: avgDistance,
      threshold: this.threshold,
      confidence: Math.min(avgDistance / this.threshold, 1)
    };
  }
}

/**
 * Utility functions for data preprocessing and analysis
 */
class KNNUtils {
  /**
   * Generate sample data for testing
   */
  static generateSampleData(type, count = 100) {
    const data = [];
    
    switch (type) {
      case 'price':
        for (let i = 0; i < count; i++) {
          data.push({
            volume: Math.random() * 1000,
            qualityScore: Math.random() * 10,
            seasonFactor: Math.random() * 2,
            demandFactor: Math.random() * 3,
            historicalPrice: 50 + Math.random() * 100,
            price: 45 + Math.random() * 110
          });
        }
        break;
        
      case 'quality':
        for (let i = 0; i < count; i++) {
          const grades = ['A', 'B', 'C', 'D'];
          data.push({
            drcPercentage: 20 + Math.random() * 40,
            moistureContent: Math.random() * 10,
            impurities: Math.random() * 5,
            colorScore: Math.random() * 10,
            viscosity: 50 + Math.random() * 200,
            qualityGrade: grades[Math.floor(Math.random() * grades.length)]
          });
        }
        break;
        
      case 'demand':
        for (let i = 0; i < count; i++) {
          data.push({
            dayOfWeek: Math.floor(Math.random() * 7),
            month: Math.floor(Math.random() * 12) + 1,
            seasonFactor: Math.random() * 4,
            weatherFactor: Math.random() * 3,
            marketTrend: Math.random() * 2,
            historicalDemand: Math.random() * 1000,
            demand: Math.random() * 1200
          });
        }
        break;
        
      case 'customer':
        for (let i = 0; i < count; i++) {
          const segments = ['VIP', 'Regular', 'New', 'At-Risk'];
          data.push({
            purchaseFrequency: Math.random() * 30,
            avgOrderValue: 100 + Math.random() * 2000,
            loyaltyScore: Math.random() * 10,
            locationFactor: Math.random() * 5,
            seasonality: Math.random() * 2,
            segment: segments[Math.floor(Math.random() * segments.length)]
          });
        }
        break;
        
      case 'anomaly':
        for (let i = 0; i < count; i++) {
          data.push({
            transactionAmount: 50 + Math.random() * 500,
            timeOfDay: Math.random() * 24,
            locationFactor: Math.random() * 10,
            userBehaviorScore: Math.random() * 10,
            frequency: Math.random() * 20
          });
        }
        break;
    }
    
    return data;
  }

  /**
   * Split data into training and testing sets
   */
  static splitData(data, testRatio = 0.2) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const testSize = Math.floor(data.length * testRatio);
    
    return {
      training: shuffled.slice(testSize),
      testing: shuffled.slice(0, testSize)
    };
  }

  /**
   * Calculate various performance metrics
   */
  static calculateMetrics(predictions, actualLabels) {
    const metrics = {
      accuracy: 0,
      precision: {},
      recall: {},
      f1Score: {}
    };

    // Calculate accuracy
    let correct = 0;
    predictions.forEach((pred, i) => {
      if (pred.label === actualLabels[i]) correct++;
    });
    metrics.accuracy = correct / predictions.length;

    // Get unique labels
    const uniqueLabels = [...new Set(actualLabels)];

    // Calculate precision, recall, and F1-score for each label
    uniqueLabels.forEach(label => {
      const truePositives = predictions.filter((pred, i) => 
        pred.label === label && actualLabels[i] === label
      ).length;
      
      const falsePositives = predictions.filter((pred, i) => 
        pred.label === label && actualLabels[i] !== label
      ).length;
      
      const falseNegatives = predictions.filter((pred, i) => 
        pred.label !== label && actualLabels[i] === label
      ).length;

      metrics.precision[label] = truePositives / (truePositives + falsePositives) || 0;
      metrics.recall[label] = truePositives / (truePositives + falseNegatives) || 0;
      
      const precision = metrics.precision[label];
      const recall = metrics.recall[label];
      metrics.f1Score[label] = 2 * (precision * recall) / (precision + recall) || 0;
    });

    return metrics;
  }
}

module.exports = {
  KNNAlgorithm,
  PricePredictionKNN,
  QualityClassificationKNN,
  DemandForecastingKNN,
  CustomerSegmentationKNN,
  AnomalyDetectionKNN,
  KNNUtils
};

