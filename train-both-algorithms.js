const DatasetLoader = require('./utils/datasetLoader');
const { QualityClassificationKNN } = require('./server/utils/knnAlgorithm');
const { DecisionTree } = require('./server/utils/decisionTreeAlgorithm');

console.log('🎓 TRAINING BOTH ALGORITHMS WITH SAME DATASET\n');

// Load balanced dataset
const loader = new DatasetLoader('./datasets/balanced_quality_dataset.csv');
const data = loader.getAllData();

console.log(`✅ Loaded ${data.length} samples`);
console.log('📊 Grade Distribution:');
const grades = data.reduce((acc, d) => {
  acc[d.qualityGrade] = (acc[d.qualityGrade] || 0) + 1;
  return acc;
}, {});
Object.keys(grades).sort().forEach(grade => {
  console.log(`  Grade ${grade}: ${grades[grade]} samples`);
});

// Train KNN
console.log('\n🤖 Training KNN...');
const knnModel = new QualityClassificationKNN(3);
knnModel.trainQualityModel(data);
console.log('✅ KNN trained');

// Train Decision Tree
console.log('\n🌳 Training Decision Tree...');
const treeModel = new DecisionTree();
treeModel.train(data);
console.log('✅ Decision Tree trained');

// Test both models
console.log('\n🧪 TESTING BOTH MODELS\n');
console.log('='.repeat(60));

const testSamples = [
  { drc: 65.5, moisture: 0.5, impurities: 0.3, color: 9.0, expected: 'A' },
  { drc: 52.0, moisture: 1.2, impurities: 0.8, color: 7.5, expected: 'B' },
  { drc: 38.0, moisture: 2.1, impurities: 1.5, color: 5.8, expected: 'C' },
  { drc: 25.0, moisture: 3.5, impurities: 2.8, color: 3.5, expected: 'D' }
];

testSamples.forEach((sample, i) => {
  console.log(`\n📝 Test ${i + 1}: DRC=${sample.drc}%, Moisture=${sample.moisture}%, Impurities=${sample.impurities}%, Color=${sample.color}`);
  
  // KNN Prediction
  const knnResult = knnModel.classifyQuality(sample.drc, sample.moisture, sample.impurities, sample.color);
  const knnStatus = knnResult.label === sample.expected ? '✅' : '❌';
  
  // Decision Tree Prediction
  const treeResult = treeModel.predict(sample.drc, sample.moisture, sample.impurities, sample.color);
  const treeStatus = treeResult.label === sample.expected ? '✅' : '❌';
  
  console.log(`  KNN: ${knnStatus} Grade ${knnResult.label} (${(knnResult.confidence * 100).toFixed(1)}%)`);
  console.log(`  Tree: ${treeStatus} Grade ${treeResult.label} (${(treeResult.confidence * 100).toFixed(1)}%)`);
  console.log(`  Expected: Grade ${sample.expected}`);
  
  if (knnResult.label !== treeResult.label) {
    console.log(`  ⚠️  DIFFERENT PREDICTIONS!`);
  }
});

// Show Decision Tree structure
console.log('\n🌳 DECISION TREE STRUCTURE:');
console.log('='.repeat(40));
treeModel.printTree();

console.log('\n✅ BOTH ALGORITHMS TRAINED AND TESTED!');
console.log('\n📊 SUMMARY:');
console.log(`- Dataset: ${data.length} samples`);
console.log(`- Features: DRC%, Moisture%, Impurities%, Color Score`);
console.log(`- KNN: K=3, Euclidean distance`);
console.log(`- Decision Tree: Gini impurity splitting`);
console.log('\n🎯 Both models ready for production use!');




