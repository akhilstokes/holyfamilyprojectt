const {
  PricePredictionKNN,
  QualityClassificationKNN,
  DemandForecastingKNN,
  CustomerSegmentationKNN,
  AnomalyDetectionKNN,
  KNNUtils
} = require('../utils/knnAlgorithm');

const SellRequest = require('../models/sellRequestModel');
const User = require('../models/userModel');
const StockTransaction = require('../models/stockTransactionModel');
const Barrel = require('../models/barrelModel');

/**
 * KNN-based Price Prediction Controller
 */
exports.predictPrice = async (req, res) => {
  try {
    const { volume, qualityScore, seasonFactor, demandFactor, historicalPrice } = req.body;

    // Validate input
    if (!volume || !qualityScore) {
      return res.status(400).json({
        success: false,
        message: 'Volume and quality score are required'
      });
    }

    // Get historical price data for training
    const historicalData = await SellRequest.find({
      status: 'VERIFIED',
      amount: { $exists: true, $gt: 0 }
    })
    .limit(1000)
    .select('totalVolumeKg drcPct marketRate amount requestedAt')
    .lean();

    if (historicalData.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient historical data for price prediction'
      });
    }

    // Prepare training data
    const trainingData = historicalData.map(record => ({
      volume: record.totalVolumeKg || 0,
      qualityScore: record.drcPct || 0,
      seasonFactor: getSeasonFactor(record.requestedAt),
      demandFactor: getDemandFactor(record.requestedAt),
      historicalPrice: record.marketRate || 0,
      price: record.amount / (record.totalVolumeKg || 1)
    }));

    // Train KNN model
    const priceModel = new PricePredictionKNN(5);
    priceModel.trainPriceModel(trainingData);

    // Make prediction
    const prediction = priceModel.predictPrice(
      volume,
      qualityScore,
      seasonFactor || getSeasonFactor(new Date()),
      demandFactor || getDemandFactor(new Date()),
      historicalPrice || 0
    );

    res.status(200).json({
      success: true,
      prediction: {
        predictedPrice: Math.round(prediction.label * 100) / 100,
        confidence: Math.round(prediction.confidence * 100) / 100,
        neighbors: prediction.neighbors.map(n => ({
          distance: Math.round(n.distance * 1000) / 1000,
          price: Math.round(n.label * 100) / 100
        })),
        modelInfo: {
          k: priceModel.k,
          trainingSamples: trainingData.length,
          distanceMetric: priceModel.distanceMetric
        }
      }
    });

  } catch (error) {
    console.error('Price prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting price',
      error: error.message
    });
  }
};

/**
 * KNN-based Quality Classification Controller
 */
exports.classifyQuality = async (req, res) => {
  try {
    const { drcPercentage, moistureContent, impurities, colorScore, viscosity } = req.body;

    // Validate input
    if (!drcPercentage) {
      return res.status(400).json({
        success: false,
        message: 'DRC percentage is required'
      });
    }

    // Get historical quality data
    const qualityData = await SellRequest.find({
      drcPct: { $exists: true },
      status: 'VERIFIED'
    })
    .limit(500)
    .select('drcPct collectionNotes status')
    .lean();

    if (qualityData.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quality data for classification'
      });
    }

    // Prepare training data with quality grades
    const trainingData = qualityData.map(record => {
      const qualityGrade = classifyQualityGrade(record.drcPct, record.collectionNotes);
      return {
        drcPercentage: record.drcPct || 0,
        moistureContent: extractMoistureFromNotes(record.collectionNotes) || 0,
        impurities: extractImpuritiesFromNotes(record.collectionNotes) || 0,
        colorScore: extractColorScoreFromNotes(record.collectionNotes) || 5,
        viscosity: extractViscosityFromNotes(record.collectionNotes) || 100,
        qualityGrade: qualityGrade
      };
    });

    // Train KNN model
    const qualityModel = new QualityClassificationKNN(3);
    qualityModel.trainQualityModel(trainingData);

    // Make prediction
    const prediction = qualityModel.classifyQuality(
      drcPercentage,
      moistureContent || 0,
      impurities || 0,
      colorScore || 5,
      viscosity || 100
    );

    res.status(200).json({
      success: true,
      classification: {
        qualityGrade: prediction.label,
        confidence: Math.round(prediction.confidence * 100) / 100,
        neighbors: prediction.neighbors.map(n => ({
          distance: Math.round(n.distance * 1000) / 1000,
          grade: n.label
        })),
        modelInfo: {
          k: qualityModel.k,
          trainingSamples: trainingData.length
        }
      }
    });

  } catch (error) {
    console.error('Quality classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error classifying quality',
      error: error.message
    });
  }
};

/**
 * KNN-based Demand Forecasting Controller
 */
exports.forecastDemand = async (req, res) => {
  try {
    const { dayOfWeek, month, seasonFactor, weatherFactor, marketTrend, historicalDemand } = req.body;

    // Get historical demand data
    const demandData = await SellRequest.find({
      status: 'VERIFIED',
      requestedAt: { $exists: true }
    })
    .limit(1000)
    .select('requestedAt totalVolumeKg')
    .lean();

    if (demandData.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient demand data for forecasting'
      });
    }

    // Prepare training data
    const trainingData = demandData.map(record => {
      const date = new Date(record.requestedAt);
      return {
        dayOfWeek: date.getDay(),
        month: date.getMonth() + 1,
        seasonFactor: getSeasonFactor(date),
        weatherFactor: getWeatherFactor(date),
        marketTrend: getMarketTrend(date),
        historicalDemand: record.totalVolumeKg || 0,
        demand: record.totalVolumeKg || 0
      };
    });

    // Train KNN model
    const demandModel = new DemandForecastingKNN(7);
    demandModel.trainDemandModel(trainingData);

    // Make prediction
    const prediction = demandModel.forecastDemand(
      dayOfWeek || new Date().getDay(),
      month || new Date().getMonth() + 1,
      seasonFactor || getSeasonFactor(new Date()),
      weatherFactor || getWeatherFactor(new Date()),
      marketTrend || getMarketTrend(new Date()),
      historicalDemand || 0
    );

    res.status(200).json({
      success: true,
      forecast: {
        predictedDemand: Math.round(prediction.label * 100) / 100,
        confidence: Math.round(prediction.confidence * 100) / 100,
        neighbors: prediction.neighbors.map(n => ({
          distance: Math.round(n.distance * 1000) / 1000,
          demand: Math.round(n.label * 100) / 100
        })),
        modelInfo: {
          k: demandModel.k,
          trainingSamples: trainingData.length
        }
      }
    });

  } catch (error) {
    console.error('Demand forecasting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error forecasting demand',
      error: error.message
    });
  }
};

/**
 * KNN-based Customer Segmentation Controller
 */
exports.segmentCustomer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { purchaseFrequency, avgOrderValue, loyaltyScore, locationFactor, seasonality } = req.body;

    // Get customer data
    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get historical customer data for training
    const customerData = await SellRequest.find({
      farmerId: { $exists: true },
      status: 'VERIFIED'
    })
    .populate('farmerId', 'name email')
    .limit(500)
    .select('farmerId amount totalVolumeKg requestedAt')
    .lean();

    if (customerData.length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient customer data for segmentation'
      });
    }

    // Prepare training data
    const trainingData = await Promise.all(
      customerData.map(async (record) => {
        const customerId = record.farmerId._id;
        
        // Calculate customer metrics
        const customerRequests = customerData.filter(r => r.farmerId._id.toString() === customerId.toString());
        const purchaseFrequency = customerRequests.length;
        const avgOrderValue = customerRequests.reduce((sum, r) => sum + (r.amount || 0), 0) / customerRequests.length;
        const loyaltyScore = calculateLoyaltyScore(customerRequests);
        const locationFactor = getLocationFactor(record.farmerId);
        const seasonality = getSeasonality(customerRequests);

        return {
          purchaseFrequency: purchaseFrequency,
          avgOrderValue: avgOrderValue,
          loyaltyScore: loyaltyScore,
          locationFactor: locationFactor,
          seasonality: seasonality,
          segment: classifyCustomerSegment(purchaseFrequency, avgOrderValue, loyaltyScore)
        };
      })
    );

    // Train KNN model
    const customerModel = new CustomerSegmentationKNN(5);
    customerModel.trainCustomerModel(trainingData);

    // Make prediction for the specific customer
    const customerRequests = customerData.filter(r => r.farmerId._id.toString() === userId);
    const customerMetrics = {
      purchaseFrequency: purchaseFrequency || customerRequests.length,
      avgOrderValue: avgOrderValue || customerRequests.reduce((sum, r) => sum + (r.amount || 0), 0) / Math.max(customerRequests.length, 1),
      loyaltyScore: loyaltyScore || calculateLoyaltyScore(customerRequests),
      locationFactor: locationFactor || getLocationFactor(customer),
      seasonality: seasonality || getSeasonality(customerRequests)
    };

    const prediction = customerModel.segmentCustomer(
      customerMetrics.purchaseFrequency,
      customerMetrics.avgOrderValue,
      customerMetrics.loyaltyScore,
      customerMetrics.locationFactor,
      customerMetrics.seasonality
    );

    res.status(200).json({
      success: true,
      segmentation: {
        customerId: userId,
        customerName: customer.name,
        segment: prediction.label,
        confidence: Math.round(prediction.confidence * 100) / 100,
        metrics: customerMetrics,
        neighbors: prediction.neighbors.map(n => ({
          distance: Math.round(n.distance * 1000) / 1000,
          segment: n.label
        })),
        modelInfo: {
          k: customerModel.k,
          trainingSamples: trainingData.length
        }
      }
    });

  } catch (error) {
    console.error('Customer segmentation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error segmenting customer',
      error: error.message
    });
  }
};

/**
 * KNN-based Anomaly Detection Controller
 */
exports.detectAnomaly = async (req, res) => {
  try {
    const { transactionAmount, timeOfDay, locationFactor, userBehaviorScore, frequency } = req.body;

    // Get normal transaction data for training
    const normalData = await SellRequest.find({
      status: 'VERIFIED',
      amount: { $gt: 0, $lt: 10000 } // Filter out extreme values for normal data
    })
    .limit(1000)
    .select('amount requestedAt farmerId')
    .lean();

    if (normalData.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient normal data for anomaly detection'
      });
    }

    // Prepare training data
    const trainingData = normalData.map(record => ({
      transactionAmount: record.amount || 0,
      timeOfDay: new Date(record.requestedAt).getHours(),
      locationFactor: getLocationFactor(record.farmerId),
      userBehaviorScore: getUserBehaviorScore(record.farmerId),
      frequency: getUserFrequency(record.farmerId)
    }));

    // Train KNN model
    const anomalyModel = new AnomalyDetectionKNN(5, 0.3);
    anomalyModel.trainAnomalyModel(trainingData);

    // Make prediction
    const prediction = anomalyModel.detectAnomaly(
      transactionAmount || 0,
      timeOfDay || new Date().getHours(),
      locationFactor || 0,
      userBehaviorScore || 5,
      frequency || 1
    );

    res.status(200).json({
      success: true,
      anomalyDetection: {
        isAnomaly: prediction.isAnomaly,
        anomalyScore: Math.round(prediction.anomalyScore * 1000) / 1000,
        confidence: Math.round(prediction.confidence * 100) / 100,
        threshold: prediction.threshold,
        riskLevel: prediction.isAnomaly ? 
          (prediction.confidence > 0.8 ? 'HIGH' : prediction.confidence > 0.5 ? 'MEDIUM' : 'LOW') : 
          'NORMAL',
        modelInfo: {
          k: anomalyModel.k,
          threshold: anomalyModel.threshold,
          trainingSamples: trainingData.length
        }
      }
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting anomaly',
      error: error.message
    });
  }
};

/**
 * Get KNN Model Performance Metrics
 */
exports.getModelMetrics = async (req, res) => {
  try {
    const { modelType } = req.params;

    // Generate sample data for testing
    const sampleData = KNNUtils.generateSampleData(modelType, 200);
    const { training, testing } = KNNUtils.splitData(sampleData, 0.3);

    let model;
    let predictions = [];

    switch (modelType) {
      case 'price':
        model = new PricePredictionKNN(5);
        model.trainPriceModel(training);
        predictions = model.predictBatch(testing.map(d => [
          d.volume, d.qualityScore, d.seasonFactor, d.demandFactor, d.historicalPrice
        ]));
        break;

      case 'quality':
        model = new QualityClassificationKNN(3);
        model.trainQualityModel(training);
        predictions = model.predictBatch(testing.map(d => [
          d.drcPercentage, d.moistureContent, d.impurities, d.colorScore, d.viscosity
        ]));
        break;

      case 'demand':
        model = new DemandForecastingKNN(7);
        model.trainDemandModel(training);
        predictions = model.predictBatch(testing.map(d => [
          d.dayOfWeek, d.month, d.seasonFactor, d.weatherFactor, d.marketTrend, d.historicalDemand
        ]));
        break;

      case 'customer':
        model = new CustomerSegmentationKNN(5);
        model.trainCustomerModel(training);
        predictions = model.predictBatch(testing.map(d => [
          d.purchaseFrequency, d.avgOrderValue, d.loyaltyScore, d.locationFactor, d.seasonality
        ]));
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid model type'
        });
    }

    // Calculate metrics
    const actualLabels = testing.map(d => {
      switch (modelType) {
        case 'price': return d.price;
        case 'quality': return d.qualityGrade;
        case 'demand': return d.demand;
        case 'customer': return d.segment;
        default: return null;
      }
    });

    const metrics = KNNUtils.calculateMetrics(predictions, actualLabels);

    res.status(200).json({
      success: true,
      modelType: modelType,
      metrics: metrics,
      modelInfo: {
        k: model.k,
        distanceMetric: model.distanceMetric,
        trainingSamples: training.length,
        testingSamples: testing.length
      }
    });

  } catch (error) {
    console.error('Model metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating model metrics',
      error: error.message
    });
  }
};

/**
 * Helper Functions
 */

function getSeasonFactor(date) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 1.2; // Spring
  if (month >= 6 && month <= 8) return 1.5; // Summer
  if (month >= 9 && month <= 11) return 1.0; // Autumn
  return 0.8; // Winter
}

function getDemandFactor(date) {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  
  // Higher demand on weekdays during business hours
  if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 17) {
    return 1.3;
  }
  return 1.0;
}

function getWeatherFactor(date) {
  // Simplified weather factor (in real implementation, integrate with weather API)
  return 1.0 + Math.random() * 0.4;
}

function getMarketTrend(date) {
  // Simplified market trend (in real implementation, integrate with market data)
  return 0.8 + Math.random() * 0.4;
}

function classifyQualityGrade(drcPct, notes) {
  if (drcPct >= 35) return 'A';
  if (drcPct >= 30) return 'B';
  if (drcPct >= 25) return 'C';
  return 'D';
}

function extractMoistureFromNotes(notes) {
  if (!notes) return 0;
  const match = notes.match(/moisture[:\s]*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 0;
}

function extractImpuritiesFromNotes(notes) {
  if (!notes) return 0;
  const match = notes.match(/impurities[:\s]*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 0;
}

function extractColorScoreFromNotes(notes) {
  if (!notes) return 5;
  const match = notes.match(/color[:\s]*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 5;
}

function extractViscosityFromNotes(notes) {
  if (!notes) return 100;
  const match = notes.match(/viscosity[:\s]*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : 100;
}

function calculateLoyaltyScore(requests) {
  if (!requests || requests.length === 0) return 0;
  
  const totalAmount = requests.reduce((sum, r) => sum + (r.amount || 0), 0);
  const avgAmount = totalAmount / requests.length;
  const frequency = requests.length;
  
  return Math.min(10, (frequency * 0.5) + (avgAmount / 1000));
}

function getLocationFactor(user) {
  // Simplified location factor (in real implementation, use actual location data)
  return Math.random() * 5;
}

function getSeasonality(requests) {
  if (!requests || requests.length === 0) return 0;
  
  const months = requests.map(r => new Date(r.requestedAt).getMonth());
  const uniqueMonths = new Set(months).size;
  
  return uniqueMonths / 12;
}

function classifyCustomerSegment(frequency, avgValue, loyalty) {
  if (frequency >= 10 && avgValue >= 1000 && loyalty >= 7) return 'VIP';
  if (frequency >= 5 && avgValue >= 500) return 'Regular';
  if (frequency < 3) return 'New';
  return 'At-Risk';
}

function getUserBehaviorScore(userId) {
  // Simplified user behavior score
  return Math.random() * 10;
}

function getUserFrequency(userId) {
  // Simplified user frequency
  return Math.random() * 20;
}

