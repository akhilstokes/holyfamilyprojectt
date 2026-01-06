const { QualityClassificationKNN } = require('./server/utils/knnAlgorithm');

console.log('🧪 QUICK TEST - Grade A Only (4 features)\n');

// Create Grade A data directly
const gradeAData = [
  { drcPercentage: 65.2, moistureContent: 0.5, impurities: 0.3, colorScore: 9.2, qualityGrade: 'A' },
  { drcPercentage: 68.5, moistureContent: 0.3, impurities: 0.2, colorScore: 9.5, qualityGrade: 'A' },
  { drcPercentage: 62.8, moistureContent: 0.6, impurities: 0.4, colorScore: 8.8, qualityGrade: 'A' },
  { drcPercentage: 66.1, moistureContent: 0.4, impurities: 0.25, colorScore: 9.1, qualityGrade: 'A' },
  { drcPercentage: 64.9, moistureContent: 0.55, impurities: 0.35, colorScore: 8.9, qualityGrade: 'A' }
];

console.log(`✅ Created ${gradeAData.length} Grade A samples`);
console.log('Features: DRC%, Moisture%, Impurities%, Color Score (NO VISCOSITY)');

// Train model
const model = new QualityClassificationKNN(3);
model.trainQualityModel(gradeAData);

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
console.log('\n🎯 DRC GRADING:');
console.log('  A: 60%+ (Premium)');
console.log('  B: 45-59%');
console.log('  C: 30-44%');
console.log('  D: <30%');




