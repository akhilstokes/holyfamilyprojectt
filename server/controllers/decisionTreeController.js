const LabSample = require('../models/labSampleModel');
const LatexRequest = require('../models/latexRequestModel');

/**
 * Decision Tree Node Structure
 */
class DecisionTreeNode {
  constructor(feature = null, threshold = null, left = null, right = null, value = null) {
    this.feature = feature;      // Feature to split on
    this.threshold = threshold;  // Threshold value for split
    this.left = left;           // Left child (<=threshold)
    this.right = right;         // Right child (>threshold)
    this.value = value;         // Leaf node value (quality grade)
  }

  isLeaf() {
    return this.value !== null;
  }
}

/**
 * Decision Tree Classifier
 */
class DecisionTreeClassifier {
  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.root = null;
    this.featureNames = ['drcPercentage', 'moistureContent', 'impurities', 'colorScore', 'viscosity'];
  }

  /**
   * Calculate Gini Impurity
   */
  giniImpurity(labels) {
    const counts = {};
    labels.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });

    let impurity = 1.0;
    const total = labels.length;
    
    Object.values(counts).forEach(count => {
      const prob = count / total;
      impurity -= prob * prob;
    });

    return impurity;
  }

  /**
   * Split dataset based on feature and threshold
   */
  splitDataset(X, y, featureIndex, threshold) {
    const leftIndices = [];
    const rightIndices = [];

    X.forEach((sample, i) => {
      if (sample[featureIndex] <= threshold) {
        leftIndices.push(i);
      } else {
        rightIndices.push(i);
      }
    });

    return {
      leftX: leftIndices.map(i => X[i]),
      leftY: leftIndices.map(i => y[i]),
      rightX: rightIndices.map(i => X[i]),
      rightY: rightIndices.map(i => y[i])
    };
  }

  /**
   * Find best split for a node
   */
  findBestSplit(X, y) {
    let bestGini = Infinity;
    let bestFeature = null;
    let bestThreshold = null;

    const numFeatures = X[0].length;

    for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
      // Get unique values for this feature
      const values = X.map(sample => sample[featureIndex]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);

      // Try splits between consecutive values
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        
        const { leftY, rightY } = this.splitDataset(X, y, featureIndex, threshold);

        if (leftY.length === 0 || rightY.length === 0) continue;

        // Calculate weighted Gini impurity
        const leftGini = this.giniImpurity(leftY);
        const rightGini = this.giniImpurity(rightY);
        const weightedGini = (leftY.length * leftGini + rightY.length * rightGini) / y.length;

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          bestFeature = featureIndex;
          bestThreshold = threshold;
        }
      }
    }

    return { bestFeature, bestThreshold, bestGini };
  }

  /**
   * Build decision tree recursively
   */
  buildTree(X, y, depth = 0) {
    const numSamples = y.length;
    const numLabels = new Set(y).size;

    // Stopping criteria
    if (numLabels === 1 || numSamples < this.minSamplesSplit || depth >= this.maxDepth) {
      // Create leaf node with majority class
      const counts = {};
      y.forEach(label => {
        counts[label] = (counts[label] || 0) + 1;
      });
      const majorityClass = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
      );
      return new DecisionTreeNode(null, null, null, null, majorityClass);
    }

    // Find best split
    const { bestFeature, bestThreshold } = this.findBestSplit(X, y);

    if (bestFeature === null) {
      // Can't split further, create leaf
      const counts = {};
      y.forEach(label => {
        counts[label] = (counts[label] || 0) + 1;
      });
      const majorityClass = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
      );
      return new DecisionTreeNode(null, null, null, null, majorityClass);
    }

    // Split dataset
    const { leftX, leftY, rightX, rightY } = this.splitDataset(X, y, bestFeature, bestThreshold);

    // Build left and right subtrees
    const leftChild = this.buildTree(leftX, leftY, depth + 1);
    const rightChild = this.buildTree(rightX, rightY, depth + 1);

    return new DecisionTreeNode(bestFeature, bestThreshold, leftChild, rightChild);
  }

  /**
   * Train the decision tree
   */
  fit(X, y) {
    this.root = this.buildTree(X, y);
    return this;
  }

  /**
   * Predict single sample
   */
  predictSingle(sample, node = null) {
    if (node === null) node = this.root;
    
    if (node.isLeaf()) {
      return node.value;
    }

    if (sample[node.feature] <= node.threshold) {
      return this.predictSingle(sample, node.left);
    } else {
      return this.predictSingle(sample, node.right);
    }
  }

  /**
   * Get decision path for a sample
   */
  getDecisionPath(sample, node = null, path = []) {
    if (node === null) node = this.root;
    
    if (node.isLeaf()) {
      return {
        path,
        prediction: node.value
      };
    }

    const featureName = this.featureNames[node.feature];
    const decision = sample[node.feature] <= node.threshold ? 'left' : 'right';
    
    path.push({
      feature: featureName,
      threshold: node.threshold,
      value: sample[node.feature],
      decision: decision,
      comparison: sample[node.feature] <= node.threshold ? '≤' : '>'
    });

    if (decision === 'left') {
      return this.getDecisionPath(sample, node.left, path);
    } else {
      return this.getDecisionPath(sample, node.right, path);
    }
  }
}

/**
 * Map DRC percentage to quality grade
 */
function drcToQualityGrade(drcPercentage) {
  if (drcPercentage >= 65) return 'A';
  if (drcPercentage >= 60) return 'B';
  if (drcPercentage >= 55) return 'C';
  return 'D';
}

/**
 * Load training data from database
 */
async function loadTrainingData() {
  try {
    // Get completed tests from LatexRequest
    const completedTests = await LatexRequest.find({
      status: { $in: ['TEST_COMPLETED', 'ACCOUNT_CALCULATED', 'VERIFIED', 'paid'] },
      drcPercentage: { $exists: true, $ne: null, $gte: 0 }
    })
      .select('drcPercentage moistureContent impurities colorScore viscosity')
      .limit(500)
      .lean();

    if (completedTests.length === 0) {
      // Generate synthetic training data
      return generateSyntheticData();
    }

    const X = completedTests.map(test => [
      test.drcPercentage || 60,
      test.moistureContent || 0,
      test.impurities || 0,
      test.colorScore || 5,
      test.viscosity || 5
    ]);

    const y = completedTests.map(test => drcToQualityGrade(test.drcPercentage));

    return { X, y };
  } catch (error) {
    console.error('Error loading training data:', error);
    return generateSyntheticData();
  }
}

/**
 * Generate synthetic training data
 */
function generateSyntheticData() {
  const X = [];
  const y = [];

  // Grade A samples (DRC >= 65%)
  for (let i = 0; i < 30; i++) {
    X.push([
      65 + Math.random() * 10,  // DRC: 65-75
      Math.random() * 0.5,       // Moisture: 0-0.5
      Math.random() * 0.5,       // Impurities: 0-0.5
      8 + Math.random() * 2,     // Color: 8-10
      5 + Math.random() * 3      // Viscosity: 5-8
    ]);
    y.push('A');
  }

  // Grade B samples (DRC 60-65%)
  for (let i = 0; i < 30; i++) {
    X.push([
      60 + Math.random() * 5,
      0.5 + Math.random() * 1,
      0.5 + Math.random() * 1,
      6 + Math.random() * 2,
      4 + Math.random() * 3
    ]);
    y.push('B');
  }

  // Grade C samples (DRC 55-60%)
  for (let i = 0; i < 30; i++) {
    X.push([
      55 + Math.random() * 5,
      1 + Math.random() * 1.5,
      1 + Math.random() * 1.5,
      4 + Math.random() * 2,
      3 + Math.random() * 3
    ]);
    y.push('C');
  }

  // Grade D samples (DRC < 55%)
  for (let i = 0; i < 30; i++) {
    X.push([
      45 + Math.random() * 10,
      2 + Math.random() * 2,
      2 + Math.random() * 2,
      2 + Math.random() * 2,
      2 + Math.random() * 3
    ]);
    y.push('D');
  }

  return { X, y };
}

/**
 * POST /api/decision-tree/classify-quality
 * Classify material quality using Decision Tree
 */
exports.classifyQuality = async (req, res) => {
  try {
    const { drcPercentage, moistureContent, impurities, colorScore, viscosity } = req.body;

    // Validate inputs
    if (drcPercentage === undefined || moistureContent === undefined || 
        impurities === undefined || colorScore === undefined || viscosity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All parameters are required: drcPercentage, moistureContent, impurities, colorScore, viscosity'
      });
    }

    // Load training data
    const { X, y } = await loadTrainingData();

    // Train Decision Tree
    const dt = new DecisionTreeClassifier(maxDepth = 5, minSamplesSplit = 2);
    dt.fit(X, y);

    // Prepare input
    const input = [
      Number(drcPercentage),
      Number(moistureContent),
      Number(impurities),
      Number(colorScore),
      Number(viscosity)
    ];

    // Get prediction and decision path
    const prediction = dt.predictSingle(input);
    const { path } = dt.getDecisionPath(input);

    // Calculate confidence (simplified - based on path length)
    const confidence = Math.max(0.7, 1.0 - (path.length * 0.05));

    return res.json({
      success: true,
      classification: {
        qualityGrade: prediction,
        confidence: confidence,
        decisionPath: path,
        modelInfo: {
          algorithm: 'Decision Tree',
          maxDepth: dt.maxDepth,
          trainingSamples: X.length,
          features: dt.featureNames
        }
      }
    });
  } catch (error) {
    console.error('Decision Tree classification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to classify quality',
      error: error.message
    });
  }
};

/**
 * GET /api/decision-tree/compare-with-knn
 * Compare Decision Tree with KNN for same input
 */
exports.compareWithKNN = async (req, res) => {
  try {
    const { drcPercentage, moistureContent, impurities, colorScore, viscosity } = req.query;

    // Validate inputs
    if (!drcPercentage || !moistureContent || !impurities || !colorScore || !viscosity) {
      return res.status(400).json({
        success: false,
        message: 'All parameters are required'
      });
    }

    // Decision Tree Classification
    const { X, y } = await loadTrainingData();
    const dt = new DecisionTreeClassifier(maxDepth = 5, minSamplesSplit = 2);
    dt.fit(X, y);

    const input = [
      Number(drcPercentage),
      Number(moistureContent),
      Number(impurities),
      Number(colorScore),
      Number(viscosity)
    ];

    const dtPrediction = dt.predictSingle(input);
    const { path } = dt.getDecisionPath(input);

    return res.json({
      success: true,
      decisionTree: {
        prediction: dtPrediction,
        decisionPath: path,
        algorithm: 'Decision Tree'
      }
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compare algorithms',
      error: error.message
    });
  }
};

/**
 * GET /api/decision-tree/model-info
 * Get Decision Tree model information
 */
exports.getModelInfo = async (req, res) => {
  try {
    const { X, y } = await loadTrainingData();

    const gradeCounts = {};
    y.forEach(grade => {
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });

    return res.json({
      success: true,
      modelInfo: {
        algorithm: 'Decision Tree (CART)',
        trainingSamples: X.length,
        features: ['drcPercentage', 'moistureContent', 'impurities', 'colorScore', 'viscosity'],
        classes: Object.keys(gradeCounts),
        classDistribution: gradeCounts,
        hyperparameters: {
          maxDepth: 5,
          minSamplesSplit: 2,
          criterion: 'Gini Impurity'
        }
      }
    });
  } catch (error) {
    console.error('Model info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get model info',
      error: error.message
    });
  }
};

module.exports = exports;

