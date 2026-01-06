const DatasetLoader = require('./utils/datasetLoader');
const { QualityClassificationKNN } = require('./server/utils/knnAlgorithm');

console.log('🧪 TESTING GRADE A ONLY (4 features)\n');

// Load Grade A dataset
const loader = new DatasetLoader('./datasets/polymer_quality_simplified.csv');
const data = loader.getAllData();

console.log(`✅ Loaded ${data.length} Grade A samples`);
console.log('Features: DRC%, Moisture%, Impurities%, Color Score');

// Train model
const model = new QualityClassificationKNN(3);
model.trainQualityModel(data);

// Test samples
const testSamples = [
  { drc: 65.5, moisture: 0.5, impurities: 0.3, color: 9.0, expected: 'A' },
  { drc: 50.0, moisture: 1.2, impurities: 0.8, color: 7.5, expected: 'B' },
  { drc: 35.0, moisture: 2.1, impurities: 1.5, color: 5.8, expected: 'C' },
  { drc: 25.0, moisture: 3.5, impurities: 2.8, color: 3.5, expected: 'D' }
];

console.log('\n📊 TESTING SAMPLES:');
testSamples.forEach((sample, i) => {
  const result = model.classifyQuality(sample.drc, sample.moisture, sample.impurities, sample.color);
  const status = result.label === sample.expected ? '✅' : '❌';
  console.log(`${i+1}. DRC: ${sample.drc}% → ${status} Predicted: ${result.label}, Expected: ${sample.expected}`);
});

console.log('\n✅ DONE! Grade A only with 4 features (no viscosity)');
