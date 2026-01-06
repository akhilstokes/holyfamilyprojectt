/**
 * Test Script for KNN Quality Classifier with Real Dataset
 * Demonstrates how to train and test the KNN model with the polymer quality dataset
 */

const DatasetLoader = require('./utils/datasetLoader');
const { QualityClassificationKNN } = require('./server/utils/knnAlgorithm');

console.log('🧪 TESTING KNN QUALITY CLASSIFIER WITH DATASET\n');
console.log('='.repeat(60));

// Step 1: Load the dataset
console.log('\n📁 Step 1: Loading Dataset...');
const loader = new DatasetLoader();
loader.loadCSV();
loader.printStatistics();

// Step 2: Validate dataset
console.log('\n🔍 Step 2: Validating Dataset...');
const validation = loader.validateDataset();

if (!validation.valid) {
  console.error('❌ Dataset validation failed! Please fix errors before proceeding.');
  process.exit(1);
}

// Step 3: Split data into training and testing sets
console.log('\n📊 Step 3: Splitting Data (80% training, 20% testing)...');
const { training, testing, trainSize, testSize } = loader.splitData(0.2, true);
console.log(`✅ Training samples: ${trainSize}`);
console.log(`✅ Testing samples: ${testSize}`);

// Step 4: Train the KNN model
console.log('\n🎓 Step 4: Training KNN Model (K=3)...');
const qualityModel = new QualityClassificationKNN(3);
qualityModel.trainQualityModel(training);
console.log('✅ Model trained successfully!');

// Step 5: Test the model with testing data
console.log('\n🧪 Step 5: Testing Model Accuracy...');
let correctPredictions = 0;
const confusionMatrix = {
  A: { A: 0, B: 0, C: 0, D: 0 },
  B: { A: 0, B: 0, C: 0, D: 0 },
  C: { A: 0, B: 0, C: 0, D: 0 },
  D: { A: 0, B: 0, C: 0, D: 0 }
};

testing.forEach((testSample, index) => {
  const prediction = qualityModel.classifyQuality(
    testSample.drcPercentage,
    testSample.moistureContent,
    testSample.impurities,
    testSample.colorScore,
    testSample.viscosity
  );

  const predictedGrade = prediction.label;
  const actualGrade = testSample.qualityGrade;

  // Update confusion matrix
  confusionMatrix[actualGrade][predictedGrade]++;

  if (predictedGrade === actualGrade) {
    correctPredictions++;
  }

  // Show first 5 predictions
  if (index < 5) {
    const status = predictedGrade === actualGrade ? '✅' : '❌';
    console.log(`${status} Sample ${index + 1}: Predicted=${predictedGrade}, Actual=${actualGrade}, Confidence=${(prediction.confidence * 100).toFixed(1)}%`);
  }
});

const accuracy = (correctPredictions / testing.length) * 100;

// Step 6: Display Results
console.log('\n📈 RESULTS');
console.log('='.repeat(60));
console.log(`Total Tests: ${testSize}`);
console.log(`Correct Predictions: ${correctPredictions}`);
console.log(`Incorrect Predictions: ${testSize - correctPredictions}`);
console.log(`Accuracy: ${accuracy.toFixed(2)}%`);

// Display Confusion Matrix
console.log('\n📊 Confusion Matrix:');
console.log('     Predicted →');
console.log('Actual ↓  |   A  |   B  |   C  |   D  |');
console.log('----------|------|------|------|------|');
['A', 'B', 'C', 'D'].forEach(actual => {
  const row = confusionMatrix[actual];
  console.log(`   ${actual}      |  ${String(row.A).padStart(3)}  |  ${String(row.B).padStart(3)}  |  ${String(row.C).padStart(3)}  |  ${String(row.D).padStart(3)}  |`);
});

// Calculate precision, recall, and F1 score for each grade
console.log('\n📊 Performance Metrics per Grade:');
console.log('Grade | Precision | Recall | F1-Score');
console.log('------|-----------|--------|----------');

['A', 'B', 'C', 'D'].forEach(grade => {
  const tp = confusionMatrix[grade][grade];
  const fp = ['A', 'B', 'C', 'D'].reduce((sum, g) => sum + (g !== grade ? confusionMatrix[g][grade] : 0), 0);
  const fn = ['A', 'B', 'C', 'D'].reduce((sum, g) => sum + (g !== grade ? confusionMatrix[grade][g] : 0), 0);

  const precision = tp + fp > 0 ? (tp / (tp + fp)) : 0;
  const recall = tp + fn > 0 ? (tp / (tp + fn)) : 0;
  const f1Score = precision + recall > 0 ? (2 * (precision * recall) / (precision + recall)) : 0;

  console.log(`  ${grade}   | ${(precision * 100).toFixed(1)}%     | ${(recall * 100).toFixed(1)}%  | ${(f1Score * 100).toFixed(1)}%`);
});

// Step 7: Test with custom samples
console.log('\n🧪 Step 7: Testing with Custom Samples...');
console.log('='.repeat(60));

const customSamples = [
  {
    name: 'High Quality Sample',
    drcPercentage: 35.5,
    moistureContent: 0.5,
    impurities: 0.3,
    colorScore: 9.0,
    viscosity: 115,
    expectedGrade: 'A'
  },
  {
    name: 'Medium Quality Sample',
    drcPercentage: 28.0,
    moistureContent: 1.2,
    impurities: 0.8,
    colorScore: 7.5,
    viscosity: 95,
    expectedGrade: 'B'
  },
  {
    name: 'Low Quality Sample',
    drcPercentage: 22.5,
    moistureContent: 2.1,
    impurities: 1.5,
    colorScore: 5.8,
    viscosity: 78,
    expectedGrade: 'C'
  },
  {
    name: 'Poor Quality Sample',
    drcPercentage: 15.0,
    moistureContent: 3.5,
    impurities: 2.8,
    colorScore: 3.5,
    viscosity: 52,
    expectedGrade: 'D'
  }
];

customSamples.forEach((sample, index) => {
  const prediction = qualityModel.classifyQuality(
    sample.drcPercentage,
    sample.moistureContent,
    sample.impurities,
    sample.colorScore,
    sample.viscosity
  );

  const status = prediction.label === sample.expectedGrade ? '✅' : '❌';
  console.log(`\n${index + 1}. ${sample.name}`);
  console.log(`   DRC: ${sample.drcPercentage}%, Moisture: ${sample.moistureContent}%, Impurities: ${sample.impurities}%`);
  console.log(`   Color: ${sample.colorScore}, Viscosity: ${sample.viscosity} cP`);
  console.log(`   ${status} Predicted: Grade ${prediction.label} (Confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);
  console.log(`   Expected: Grade ${sample.expectedGrade}`);
});

// Step 8: Find optimal K value
console.log('\n\n🔧 Step 8: Finding Optimal K Value...');
console.log('='.repeat(60));
console.log('Testing different K values (1-10)...');

const kResults = [];
for (let k = 1; k <= 10; k++) {
  const tempModel = new QualityClassificationKNN(k);
  tempModel.trainQualityModel(training);
  
  let correct = 0;
  testing.forEach(testSample => {
    const prediction = tempModel.classifyQuality(
      testSample.drcPercentage,
      testSample.moistureContent,
      testSample.impurities,
      testSample.colorScore,
      testSample.viscosity
    );
    if (prediction.label === testSample.qualityGrade) {
      correct++;
    }
  });
  
  const kAccuracy = (correct / testing.length) * 100;
  kResults.push({ k, accuracy: kAccuracy });
  console.log(`K=${k}: ${kAccuracy.toFixed(2)}% accuracy`);
}

const bestK = kResults.reduce((best, current) => 
  current.accuracy > best.accuracy ? current : best
);

console.log(`\n🎯 Optimal K Value: ${bestK.k} (Accuracy: ${bestK.accuracy.toFixed(2)}%)`);

// Final Summary
console.log('\n\n✅ TEST COMPLETE!');
console.log('='.repeat(60));
console.log('Summary:');
console.log(`• Dataset: ${training.length + testing.length} total samples`);
console.log(`• Training: ${training.length} samples`);
console.log(`• Testing: ${testing.length} samples`);
console.log(`• Model Accuracy: ${accuracy.toFixed(2)}%`);
console.log(`• Recommended K: ${bestK.k}`);
console.log('\n📝 Next Steps:');
console.log('1. Use the trained model in your API endpoints');
console.log('2. Monitor prediction accuracy in production');
console.log('3. Collect more real data to improve the model');
console.log('4. Consider ensemble methods for better accuracy');
console.log('='.repeat(60));





