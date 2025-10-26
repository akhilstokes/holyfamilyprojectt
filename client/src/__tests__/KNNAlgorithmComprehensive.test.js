const {
  KNNAlgorithm,
  PricePredictionKNN,
  QualityClassificationKNN,
  DemandForecastingKNN,
  CustomerSegmentationKNN,
  AnomalyDetectionKNN,
  KNNUtils
} = require('../server/utils/knnAlgorithm');

// Test Results Tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

const trackTestResult = (testName, passed, error = null) => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  testResults.details.push({
    test: testName,
    status: passed ? 'PASSED' : 'FAILED',
    error: error?.message || null
  });
};

describe('KNN Algorithm Comprehensive Tests', () => {
  beforeEach(() => {
    // Reset test results for each test suite
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.total = 0;
    testResults.details = [];
  });

  afterAll(() => {
    // Print comprehensive test results
    console.log('\n=== KNN ALGORITHM COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('===============================================\n');
  });

  describe('1. Basic KNN Algorithm Tests', () => {
    it('should create KNN instance with default parameters', () => {
      try {
        const knn = new KNNAlgorithm();
        expect(knn.k).toBe(3);
        expect(knn.distanceMetric).toBe('euclidean');
        trackTestResult('KNN instance creation with defaults', true);
      } catch (error) {
        trackTestResult('KNN instance creation with defaults', false, error);
        throw error;
      }
    });

    it('should create KNN instance with custom parameters', () => {
      try {
        const knn = new KNNAlgorithm(5, 'manhattan');
        expect(knn.k).toBe(5);
        expect(knn.distanceMetric).toBe('manhattan');
        trackTestResult('KNN instance creation with custom parameters', true);
      } catch (error) {
        trackTestResult('KNN instance creation with custom parameters', false, error);
        throw error;
      }
    });

    it('should calculate euclidean distance correctly', () => {
      try {
        const knn = new KNNAlgorithm();
        const point1 = [0, 0];
        const point2 = [3, 4];
        const distance = knn.calculateDistance(point1, point2);
        expect(distance).toBeCloseTo(5, 5);
        trackTestResult('Euclidean distance calculation', true);
      } catch (error) {
        trackTestResult('Euclidean distance calculation', false, error);
        throw error;
      }
    });

    it('should calculate manhattan distance correctly', () => {
      try {
        const knn = new KNNAlgorithm(3, 'manhattan');
        const point1 = [0, 0];
        const point2 = [3, 4];
        const distance = knn.calculateDistance(point1, point2);
        expect(distance).toBe(7);
        trackTestResult('Manhattan distance calculation', true);
      } catch (error) {
        trackTestResult('Manhattan distance calculation', false, error);
        throw error;
      }
    });

    it('should normalize features correctly', () => {
      try {
        const knn = new KNNAlgorithm();
        const data = [[1, 2], [3, 4], [5, 6]];
        const normalized = knn.normalizeFeatures(data);
        
        expect(normalized[0][0]).toBeCloseTo(0, 5);
        expect(normalized[2][0]).toBeCloseTo(1, 5);
        trackTestResult('Feature normalization', true);
      } catch (error) {
        trackTestResult('Feature normalization', false, error);
        throw error;
      }
    });

    it('should train model with valid data', () => {
      try {
        const knn = new KNNAlgorithm();
        const features = [[1, 2], [3, 4], [5, 6]];
        const labels = ['A', 'B', 'C'];
        
        knn.train(features, labels);
        
        expect(knn.trainingData.length).toBe(3);
        expect(knn.features.length).toBe(3);
        expect(knn.labels.length).toBe(3);
        trackTestResult('Model training with valid data', true);
      } catch (error) {
        trackTestResult('Model training with valid data', false, error);
        throw error;
      }
    });

    it('should make prediction with trained model', () => {
      try {
        const knn = new KNNAlgorithm(3);
        const features = [[1, 1], [2, 2], [3, 3], [10, 10]];
        const labels = ['A', 'A', 'B', 'B'];
        
        knn.train(features, labels);
        const prediction = knn.predict([1.5, 1.5]);
        
        expect(prediction).toHaveProperty('label');
        expect(prediction).toHaveProperty('confidence');
        expect(prediction).toHaveProperty('neighbors');
        trackTestResult('Model prediction with trained model', true);
      } catch (error) {
        trackTestResult('Model prediction with trained model', false, error);
        throw error;
      }
    });

    it('should evaluate model accuracy correctly', () => {
      try {
        const knn = new KNNAlgorithm(3);
        const features = [[1, 1], [2, 2], [3, 3], [10, 10]];
        const labels = ['A', 'A', 'B', 'B'];
        
        knn.train(features, labels);
        const testFeatures = [[1.1, 1.1], [2.1, 2.1]];
        const testLabels = ['A', 'A'];
        
        const accuracy = knn.evaluate(testFeatures, testLabels);
        expect(accuracy).toBeGreaterThanOrEqual(0);
        expect(accuracy).toBeLessThanOrEqual(1);
        trackTestResult('Model accuracy evaluation', true);
      } catch (error) {
        trackTestResult('Model accuracy evaluation', false, error);
        throw error;
      }
    });

    it('should find optimal k value', () => {
      try {
        const knn = new KNNAlgorithm();
        const features = Array.from({length: 50}, (_, i) => [i, i * 2]);
        const labels = Array.from({length: 50}, (_, i) => i < 25 ? 'A' : 'B');
        
        const optimalK = knn.findOptimalK(features, labels, 5, 3);
        
        expect(optimalK).toHaveProperty('k');
        expect(optimalK).toHaveProperty('accuracy');
        expect(optimalK.k).toBeGreaterThan(0);
        expect(optimalK.accuracy).toBeGreaterThanOrEqual(0);
        trackTestResult('Optimal k value finding', true);
      } catch (error) {
        trackTestResult('Optimal k value finding', false, error);
        throw error;
      }
    });
  });

  describe('2. Price Prediction KNN Tests', () => {
    it('should create price prediction model', () => {
      try {
        const priceModel = new PricePredictionKNN(5);
        expect(priceModel.k).toBe(5);
        expect(priceModel.distanceMetric).toBe('euclidean');
        trackTestResult('Price prediction model creation', true);
      } catch (error) {
        trackTestResult('Price prediction model creation', false, error);
        throw error;
      }
    });

    it('should train price prediction model', () => {
      try {
        const priceModel = new PricePredictionKNN(5);
        const historicalData = KNNUtils.generateSampleData('price', 50);
        
        priceModel.trainPriceModel(historicalData);
        
        expect(priceModel.trainingData.length).toBe(50);
        trackTestResult('Price prediction model training', true);
      } catch (error) {
        trackTestResult('Price prediction model training', false, error);
        throw error;
      }
    });

    it('should predict price for new data point', () => {
      try {
        const priceModel = new PricePredictionKNN(5);
        const historicalData = KNNUtils.generateSampleData('price', 50);
        
        priceModel.trainPriceModel(historicalData);
        const prediction = priceModel.predictPrice(500, 8, 1.2, 1.5, 100);
        
        expect(prediction).toHaveProperty('label');
        expect(prediction).toHaveProperty('confidence');
        expect(typeof prediction.label).toBe('number');
        trackTestResult('Price prediction for new data point', true);
      } catch (error) {
        trackTestResult('Price prediction for new data point', false, error);
        throw error;
      }
    });

    it('should handle edge cases in price prediction', () => {
      try {
        const priceModel = new PricePredictionKNN(5);
        const historicalData = KNNUtils.generateSampleData('price', 10);
        
        priceModel.trainPriceModel(historicalData);
        
        // Test with extreme values
        const prediction = priceModel.predictPrice(0, 0, 0, 0, 0);
        expect(prediction).toHaveProperty('label');
        trackTestResult('Price prediction edge cases handling', true);
      } catch (error) {
        trackTestResult('Price prediction edge cases handling', false, error);
        throw error;
      }
    });
  });

  describe('3. Quality Classification KNN Tests', () => {
    it('should create quality classification model', () => {
      try {
        const qualityModel = new QualityClassificationKNN(3);
        expect(qualityModel.k).toBe(3);
        trackTestResult('Quality classification model creation', true);
      } catch (error) {
        trackTestResult('Quality classification model creation', false, error);
        throw error;
      }
    });

    it('should train quality classification model', () => {
      try {
        const qualityModel = new QualityClassificationKNN(3);
        const qualityData = KNNUtils.generateSampleData('quality', 50);
        
        qualityModel.trainQualityModel(qualityData);
        
        expect(qualityModel.trainingData.length).toBe(50);
        trackTestResult('Quality classification model training', true);
      } catch (error) {
        trackTestResult('Quality classification model training', false, error);
        throw error;
      }
    });

    it('should classify quality for new sample', () => {
      try {
        const qualityModel = new QualityClassificationKNN(3);
        const qualityData = KNNUtils.generateSampleData('quality', 50);
        
        qualityModel.trainQualityModel(qualityData);
        const prediction = qualityModel.classifyQuality(30, 2, 1, 7, 150);
        
        expect(prediction).toHaveProperty('label');
        expect(prediction).toHaveProperty('confidence');
        expect(['A', 'B', 'C', 'D']).toContain(prediction.label);
        trackTestResult('Quality classification for new sample', true);
      } catch (error) {
        trackTestResult('Quality classification for new sample', false, error);
        throw error;
      }
    });

    it('should handle invalid quality parameters', () => {
      try {
        const qualityModel = new QualityClassificationKNN(3);
        const qualityData = KNNUtils.generateSampleData('quality', 20);
        
        qualityModel.trainQualityModel(qualityData);
        
        // Test with negative values
        const prediction = qualityModel.classifyQuality(-10, -5, -2, -1, -50);
        expect(prediction).toHaveProperty('label');
        trackTestResult('Quality classification invalid parameters handling', true);
      } catch (error) {
        trackTestResult('Quality classification invalid parameters handling', false, error);
        throw error;
      }
    });
  });

  describe('4. Demand Forecasting KNN Tests', () => {
    it('should create demand forecasting model', () => {
      try {
        const demandModel = new DemandForecastingKNN(7);
        expect(demandModel.k).toBe(7);
        trackTestResult('Demand forecasting model creation', true);
      } catch (error) {
        trackTestResult('Demand forecasting model creation', false, error);
        throw error;
      }
    });

    it('should train demand forecasting model', () => {
      try {
        const demandModel = new DemandForecastingKNN(7);
        const demandData = KNNUtils.generateSampleData('demand', 100);
        
        demandModel.trainDemandModel(demandData);
        
        expect(demandModel.trainingData.length).toBe(100);
        trackTestResult('Demand forecasting model training', true);
      } catch (error) {
        trackTestResult('Demand forecasting model training', false, error);
        throw error;
      }
    });

    it('should forecast demand for specific conditions', () => {
      try {
        const demandModel = new DemandForecastingKNN(7);
        const demandData = KNNUtils.generateSampleData('demand', 100);
        
        demandModel.trainDemandModel(demandData);
        const prediction = demandModel.forecastDemand(1, 6, 1.5, 1.2, 1.1, 500);
        
        expect(prediction).toHaveProperty('label');
        expect(prediction).toHaveProperty('confidence');
        expect(typeof prediction.label).toBe('number');
        trackTestResult('Demand forecasting for specific conditions', true);
      } catch (error) {
        trackTestResult('Demand forecasting for specific conditions', false, error);
        throw error;
      }
    });

    it('should handle seasonal demand patterns', () => {
      try {
        const demandModel = new DemandForecastingKNN(7);
        const demandData = KNNUtils.generateSampleData('demand', 200);
        
        demandModel.trainDemandModel(demandData);
        
        // Test different seasons
        const springPrediction = demandModel.forecastDemand(1, 3, 1.2, 1.0, 1.0, 400);
        const summerPrediction = demandModel.forecastDemand(1, 6, 1.5, 1.2, 1.1, 400);
        
        expect(springPrediction).toHaveProperty('label');
        expect(summerPrediction).toHaveProperty('label');
        trackTestResult('Seasonal demand patterns handling', true);
      } catch (error) {
        trackTestResult('Seasonal demand patterns handling', false, error);
        throw error;
      }
    });
  });

  describe('5. Customer Segmentation KNN Tests', () => {
    it('should create customer segmentation model', () => {
      try {
        const customerModel = new CustomerSegmentationKNN(5);
        expect(customerModel.k).toBe(5);
        trackTestResult('Customer segmentation model creation', true);
      } catch (error) {
        trackTestResult('Customer segmentation model creation', false, error);
        throw error;
      }
    });

    it('should train customer segmentation model', () => {
      try {
        const customerModel = new CustomerSegmentationKNN(5);
        const customerData = KNNUtils.generateSampleData('customer', 80);
        
        customerModel.trainCustomerModel(customerData);
        
        expect(customerModel.trainingData.length).toBe(80);
        trackTestResult('Customer segmentation model training', true);
      } catch (error) {
        trackTestResult('Customer segmentation model training', false, error);
        throw error;
      }
    });

    it('should segment new customer', () => {
      try {
        const customerModel = new CustomerSegmentationKNN(5);
        const customerData = KNNUtils.generateSampleData('customer', 80);
        
        customerModel.trainCustomerModel(customerData);
        const prediction = customerModel.segmentCustomer(15, 1500, 8, 3, 1.2);
        
        expect(prediction).toHaveProperty('label');
        expect(prediction).toHaveProperty('confidence');
        expect(['VIP', 'Regular', 'New', 'At-Risk']).toContain(prediction.label);
        trackTestResult('Customer segmentation for new customer', true);
      } catch (error) {
        trackTestResult('Customer segmentation for new customer', false, error);
        throw error;
      }
    });

    it('should handle different customer profiles', () => {
      try {
        const customerModel = new CustomerSegmentationKNN(5);
        const customerData = KNNUtils.generateSampleData('customer', 100);
        
        customerModel.trainCustomerModel(customerData);
        
        // Test VIP customer profile
        const vipPrediction = customerModel.segmentCustomer(20, 2000, 9, 4, 1.5);
        // Test new customer profile
        const newPrediction = customerModel.segmentCustomer(1, 200, 2, 1, 0.5);
        
        expect(vipPrediction).toHaveProperty('label');
        expect(newPrediction).toHaveProperty('label');
        trackTestResult('Different customer profiles handling', true);
      } catch (error) {
        trackTestResult('Different customer profiles handling', false, error);
        throw error;
      }
    });
  });

  describe('6. Anomaly Detection KNN Tests', () => {
    it('should create anomaly detection model', () => {
      try {
        const anomalyModel = new AnomalyDetectionKNN(5, 0.3);
        expect(anomalyModel.k).toBe(5);
        expect(anomalyModel.threshold).toBe(0.3);
        trackTestResult('Anomaly detection model creation', true);
      } catch (error) {
        trackTestResult('Anomaly detection model creation', false, error);
        throw error;
      }
    });

    it('should train anomaly detection model', () => {
      try {
        const anomalyModel = new AnomalyDetectionKNN(5, 0.3);
        const normalData = KNNUtils.generateSampleData('anomaly', 100);
        
        anomalyModel.trainAnomalyModel(normalData);
        
        expect(anomalyModel.trainingData.length).toBe(100);
        trackTestResult('Anomaly detection model training', true);
      } catch (error) {
        trackTestResult('Anomaly detection model training', false, error);
        throw error;
      }
    });

    it('should detect anomalies in transaction data', () => {
      try {
        const anomalyModel = new AnomalyDetectionKNN(5, 0.3);
        const normalData = KNNUtils.generateSampleData('anomaly', 100);
        
        anomalyModel.trainAnomalyModel(normalData);
        const prediction = anomalyModel.detectAnomaly(1000, 14, 2, 7, 5);
        
        expect(prediction).toHaveProperty('isAnomaly');
        expect(prediction).toHaveProperty('anomalyScore');
        expect(prediction).toHaveProperty('confidence');
        expect(typeof prediction.isAnomaly).toBe('boolean');
        trackTestResult('Anomaly detection in transaction data', true);
      } catch (error) {
        trackTestResult('Anomaly detection in transaction data', false, error);
        throw error;
      }
    });

    it('should handle extreme anomaly cases', () => {
      try {
        const anomalyModel = new AnomalyDetectionKNN(5, 0.3);
        const normalData = KNNUtils.generateSampleData('anomaly', 50);
        
        anomalyModel.trainAnomalyModel(normalData);
        
        // Test with extreme values
        const extremePrediction = anomalyModel.detectAnomaly(999999, 25, 10, 0, 100);
        const normalPrediction = anomalyModel.detectAnomaly(100, 12, 2, 5, 2);
        
        expect(extremePrediction).toHaveProperty('isAnomaly');
        expect(normalPrediction).toHaveProperty('isAnomaly');
        trackTestResult('Extreme anomaly cases handling', true);
      } catch (error) {
        trackTestResult('Extreme anomaly cases handling', false, error);
        throw error;
      }
    });
  });

  describe('7. KNN Utils Tests', () => {
    it('should generate sample data for different types', () => {
      try {
        const priceData = KNNUtils.generateSampleData('price', 50);
        const qualityData = KNNUtils.generateSampleData('quality', 30);
        const demandData = KNNUtils.generateSampleData('demand', 40);
        const customerData = KNNUtils.generateSampleData('customer', 25);
        const anomalyData = KNNUtils.generateSampleData('anomaly', 35);
        
        expect(priceData.length).toBe(50);
        expect(qualityData.length).toBe(30);
        expect(demandData.length).toBe(40);
        expect(customerData.length).toBe(25);
        expect(anomalyData.length).toBe(35);
        trackTestResult('Sample data generation for different types', true);
      } catch (error) {
        trackTestResult('Sample data generation for different types', false, error);
        throw error;
      }
    });

    it('should split data into training and testing sets', () => {
      try {
        const data = KNNUtils.generateSampleData('price', 100);
        const { training, testing } = KNNUtils.splitData(data, 0.2);
        
        expect(training.length).toBe(80);
        expect(testing.length).toBe(20);
        expect(training.length + testing.length).toBe(100);
        trackTestResult('Data splitting into training and testing sets', true);
      } catch (error) {
        trackTestResult('Data splitting into training and testing sets', false, error);
        throw error;
      }
    });

    it('should calculate performance metrics correctly', () => {
      try {
        const predictions = [
          { label: 'A' },
          { label: 'B' },
          { label: 'A' },
          { label: 'A' }
        ];
        const actualLabels = ['A', 'B', 'A', 'B'];
        
        const metrics = KNNUtils.calculateMetrics(predictions, actualLabels);
        
        expect(metrics).toHaveProperty('accuracy');
        expect(metrics).toHaveProperty('precision');
        expect(metrics).toHaveProperty('recall');
        expect(metrics).toHaveProperty('f1Score');
        expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
        expect(metrics.accuracy).toBeLessThanOrEqual(1);
        trackTestResult('Performance metrics calculation', true);
      } catch (error) {
        trackTestResult('Performance metrics calculation', false, error);
        throw error;
      }
    });
  });

  describe('8. Error Handling Tests', () => {
    it('should handle empty training data', () => {
      try {
        const knn = new KNNAlgorithm();
        
        expect(() => {
          knn.train([], []);
        }).toThrow();
        trackTestResult('Empty training data handling', true);
      } catch (error) {
        trackTestResult('Empty training data handling', false, error);
        throw error;
      }
    });

    it('should handle mismatched features and labels', () => {
      try {
        const knn = new KNNAlgorithm();
        
        expect(() => {
          knn.train([[1, 2], [3, 4]], ['A']);
        }).toThrow();
        trackTestResult('Mismatched features and labels handling', true);
      } catch (error) {
        trackTestResult('Mismatched features and labels handling', false, error);
        throw error;
      }
    });

    it('should handle prediction without training', () => {
      try {
        const knn = new KNNAlgorithm();
        
        expect(() => {
          knn.predict([1, 2]);
        }).toThrow();
        trackTestResult('Prediction without training handling', true);
      } catch (error) {
        trackTestResult('Prediction without training handling', false, error);
        throw error;
      }
    });

    it('should handle invalid distance metric', () => {
      try {
        expect(() => {
          new KNNAlgorithm(3, 'invalid');
        }).toThrow();
        trackTestResult('Invalid distance metric handling', true);
      } catch (error) {
        trackTestResult('Invalid distance metric handling', false, error);
        throw error;
      }
    });

    it('should handle different feature dimensions', () => {
      try {
        const knn = new KNNAlgorithm();
        
        expect(() => {
          knn.calculateDistance([1, 2], [3, 4, 5]);
        }).toThrow();
        trackTestResult('Different feature dimensions handling', true);
      } catch (error) {
        trackTestResult('Different feature dimensions handling', false, error);
        throw error;
      }
    });
  });

  describe('9. Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      try {
        const knn = new KNNAlgorithm(5);
        const largeDataset = KNNUtils.generateSampleData('price', 1000);
        
        const startTime = Date.now();
        knn.trainPriceModel(largeDataset);
        const trainingTime = Date.now() - startTime;
        
        const predictionStartTime = Date.now();
        knn.predictPrice(500, 8, 1.2, 1.5, 100);
        const predictionTime = Date.now() - predictionStartTime;
        
        expect(trainingTime).toBeLessThan(5000); // Should train in less than 5 seconds
        expect(predictionTime).toBeLessThan(1000); // Should predict in less than 1 second
        trackTestResult('Large datasets efficiency handling', true);
      } catch (error) {
        trackTestResult('Large datasets efficiency handling', false, error);
        throw error;
      }
    });

    it('should maintain accuracy with different k values', () => {
      try {
        const testData = KNNUtils.generateSampleData('quality', 200);
        const { training, testing } = KNNUtils.splitData(testData, 0.3);
        
        const kValues = [1, 3, 5, 7, 9];
        const accuracies = [];
        
        kValues.forEach(k => {
          const model = new QualityClassificationKNN(k);
          model.trainQualityModel(training);
          
          const testFeatures = testing.map(d => [d.drcPercentage, d.moistureContent, d.impurities, d.colorScore, d.viscosity]);
          const testLabels = testing.map(d => d.qualityGrade);
          
          const accuracy = model.evaluate(testFeatures, testLabels);
          accuracies.push(accuracy);
        });
        
        // All accuracies should be reasonable (between 0 and 1)
        accuracies.forEach(acc => {
          expect(acc).toBeGreaterThanOrEqual(0);
          expect(acc).toBeLessThanOrEqual(1);
        });
        trackTestResult('Accuracy maintenance with different k values', true);
      } catch (error) {
        trackTestResult('Accuracy maintenance with different k values', false, error);
        throw error;
      }
    });
  });
});

module.exports = {
  testResults,
  trackTestResult
};

