/**
 * Decision Tree Algorithm for Quality Classification
 * Simple implementation for polymer quality grading
 */

class DecisionTree {
  constructor() {
    this.tree = null;
    this.featureNames = ['drcPercentage', 'moistureContent', 'impurities', 'colorScore'];
  }

  /**
   * Train the decision tree
   */
  train(data) {
    this.tree = this.buildTree(data, this.featureNames);
  }

  /**
   * Build decision tree recursively
   */
  buildTree(data, features) {
    // Check if all samples have same class
    const classes = data.map(d => d.qualityGrade);
    if (this.allSame(classes)) {
      return { type: 'leaf', value: classes[0] };
    }

    // Find best split
    const bestSplit = this.findBestSplit(data, features);
    if (!bestSplit) {
      return { type: 'leaf', value: this.mostCommon(classes) };
    }

    // Split data
    const leftData = data.filter(d => d[bestSplit.feature] <= bestSplit.threshold);
    const rightData = data.filter(d => d[bestSplit.feature] > bestSplit.threshold);

    // Build subtrees
    const leftTree = this.buildTree(leftData, features);
    const rightTree = this.buildTree(rightData, features);

    return {
      type: 'node',
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: leftTree,
      right: rightTree
    };
  }

  /**
   * Find best split for a feature
   */
  findBestSplit(data, features) {
    let bestGini = Infinity;
    let bestSplit = null;

    for (const feature of features) {
      const values = data.map(d => d[feature]).sort((a, b) => a - b);
      
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const gini = this.calculateGini(data, feature, threshold);
        
        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { feature, threshold, gini };
        }
      }
    }

    return bestSplit;
  }

  /**
   * Calculate Gini impurity
   */
  calculateGini(data, feature, threshold) {
    const left = data.filter(d => d[feature] <= threshold);
    const right = data.filter(d => d[feature] > threshold);

    const leftGini = this.giniImpurity(left.map(d => d.qualityGrade));
    const rightGini = this.giniImpurity(right.map(d => d.qualityGrade));

    const leftWeight = left.length / data.length;
    const rightWeight = right.length / data.length;

    return leftWeight * leftGini + rightWeight * rightGini;
  }

  /**
   * Calculate Gini impurity for a set of classes
   */
  giniImpurity(classes) {
    const counts = {};
    classes.forEach(c => counts[c] = (counts[c] || 0) + 1);
    
    let gini = 1;
    const total = classes.length;
    
    Object.values(counts).forEach(count => {
      const prob = count / total;
      gini -= prob * prob;
    });
    
    return gini;
  }

  /**
   * Check if all elements are the same
   */
  allSame(arr) {
    return arr.every(val => val === arr[0]);
  }

  /**
   * Find most common class
   */
  mostCommon(classes) {
    const counts = {};
    classes.forEach(c => counts[c] = (counts[c] || 0) + 1);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Predict quality grade
   */
  predict(drcPercentage, moistureContent, impurities, colorScore) {
    const sample = { drcPercentage, moistureContent, impurities, colorScore };
    return this.traverseTree(sample, this.tree);
  }

  /**
   * Traverse tree to make prediction
   */
  traverseTree(sample, node) {
    if (node.type === 'leaf') {
      return {
        label: node.value,
        confidence: 1.0,
        path: []
      };
    }

    const value = sample[node.feature];
    const nextNode = value <= node.threshold ? node.left : node.right;
    const result = this.traverseTree(sample, nextNode);
    
    result.path.unshift({
      feature: node.feature,
      threshold: node.threshold,
      decision: value <= node.threshold ? 'left' : 'right',
      value: value
    });

    return result;
  }

  /**
   * Print tree structure
   */
  printTree(node = this.tree, depth = 0) {
    const indent = '  '.repeat(depth);
    
    if (node.type === 'leaf') {
      console.log(`${indent}→ ${node.value}`);
      return;
    }

    console.log(`${indent}${node.feature} <= ${node.threshold.toFixed(2)}`);
    console.log(`${indent}├─ YES:`);
    this.printTree(node.left, depth + 1);
    console.log(`${indent}└─ NO:`);
    this.printTree(node.right, depth + 1);
  }
}

module.exports = { DecisionTree };




