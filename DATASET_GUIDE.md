# 📊 Polymer Quality Dataset Guide

## Overview

This guide explains the polymer quality training dataset used for the KNN Quality Classifier in the Holy Family Polymers system.

---

## 📁 Dataset Information

### Location
```
datasets/polymer_quality_training_data.csv
```

### Format
CSV (Comma-Separated Values) with the following columns:

| Column | Description | Range | Unit |
|--------|-------------|-------|------|
| `drcPercentage` | Dry Rubber Content percentage | 0-100 | % |
| `moistureContent` | Moisture content in the material | 0-100 | % |
| `impurities` | Percentage of impurities | 0-100 | % |
| `colorScore` | Visual color quality score | 0-10 | score |
| `viscosity` | Material viscosity | 0+ | cP (centipoise) |
| `qualityGrade` | Quality classification | A/B/C/D | grade |

---

## 📈 Dataset Statistics

### Total Records: 250 samples

### Grade Distribution:
- **Grade A**: 60 samples (24%) - Excellent Quality, Premium Grade
  - DRC > 30%, Low moisture (< 0.6%), Minimal impurities (< 0.5%)
  
- **Grade B**: 60 samples (24%) - Good Quality, Standard Grade
  - DRC 25-30%, Moderate moisture (0.5-1.5%), Low impurities (0.5-1.5%)
  
- **Grade C**: 60 samples (24%) - Fair Quality, Acceptable Grade
  - DRC 20-25%, Higher moisture (1-2.5%), Some impurities (1-2.5%)
  
- **Grade D**: 70 samples (28%) - Poor Quality, Low Grade
  - DRC < 20%, High moisture (> 2%), High impurities (> 2%)

### Feature Ranges:

#### DRC Percentage
- **Min**: 13.9%
- **Max**: 39.1%
- **Average**: 27.8%
- **Grade A**: 32.5% - 39.1%
- **Grade B**: 26.9% - 31.5%
- **Grade C**: 20.9% - 25.5%
- **Grade D**: 13.9% - 18.5%

#### Moisture Content
- **Min**: 0.25%
- **Max**: 3.6%
- **Average**: 1.52%
- **Grade A**: 0.25% - 0.58%
- **Grade B**: 0.94% - 1.32%
- **Grade C**: 1.8% - 2.35%
- **Grade D**: 2.75% - 3.6%

#### Impurities
- **Min**: 0.18%
- **Max**: 2.9%
- **Average**: 1.21%
- **Grade A**: 0.18% - 0.41%
- **Grade B**: 0.66% - 0.9%
- **Grade C**: 1.27% - 1.65%
- **Grade D**: 2.15% - 2.9%

#### Color Score
- **Min**: 3.2
- **Max**: 9.7
- **Average**: 6.8
- **Grade A**: 8.6 - 9.7
- **Grade B**: 7.0 - 8.1
- **Grade C**: 5.2 - 6.5
- **Grade D**: 3.2 - 4.7

#### Viscosity
- **Min**: 48 cP
- **Max**: 122 cP
- **Average**: 82 cP
- **Grade A**: 109 - 122 cP
- **Grade B**: 90 - 102 cP
- **Grade C**: 72 - 87 cP
- **Grade D**: 48 - 66 cP

---

## 🚀 How to Use the Dataset

### 1. Using DatasetLoader

```javascript
const DatasetLoader = require('./utils/datasetLoader');

// Create loader instance
const loader = new DatasetLoader();

// Load all data
const allData = loader.getAllData();
console.log(`Loaded ${allData.length} records`);

// Get data by grade
const gradeAData = loader.getDataByGrade('A');
console.log(`Grade A samples: ${gradeAData.length}`);

// Split into training and testing
const { training, testing } = loader.splitData(0.2); // 80/20 split
console.log(`Training: ${training.length}, Testing: ${testing.length}`);

// Get statistics
loader.printStatistics();

// Validate dataset
const validation = loader.validateDataset();
console.log(`Valid: ${validation.valid}`);
```

### 2. Training KNN Model with Dataset

```javascript
const DatasetLoader = require('./utils/datasetLoader');
const { QualityClassificationKNN } = require('./server/utils/knnAlgorithm');

// Load dataset
const loader = new DatasetLoader();
const { training } = loader.splitData(0.2);

// Train model
const qualityModel = new QualityClassificationKNN(3); // K=3
qualityModel.trainQualityModel(training);

// Make prediction
const prediction = qualityModel.classifyQuality(
  35.5,  // DRC percentage
  0.5,   // Moisture content
  0.3,   // Impurities
  9.0,   // Color score
  115    // Viscosity
);

console.log(`Predicted Grade: ${prediction.label}`);
console.log(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
```

### 3. Running the Test Script

```bash
# Test the quality classifier with the dataset
node test-quality-classifier-dataset.js
```

This will:
- Load the dataset
- Validate data integrity
- Split into training/testing sets
- Train the KNN model
- Test accuracy
- Show confusion matrix
- Display performance metrics
- Test custom samples
- Find optimal K value

---

## 📊 Sample Dataset Records

### Grade A Samples (Excellent Quality)
```csv
drcPercentage,moistureContent,impurities,colorScore,viscosity,qualityGrade
35.2,0.5,0.3,9.2,115,A
38.5,0.3,0.2,9.5,118,A
36.1,0.4,0.25,9.1,116,A
```

### Grade B Samples (Good Quality)
```csv
28.5,1.2,0.8,7.5,95,B
30.2,1.0,0.7,7.8,98,B
29.5,1.1,0.75,7.6,96,B
```

### Grade C Samples (Fair Quality)
```csv
22.5,2.1,1.5,5.8,78,C
24.2,1.9,1.35,6.1,82,C
23.5,2.0,1.42,5.9,80,C
```

### Grade D Samples (Poor Quality)
```csv
15.5,3.2,2.5,3.8,55,D
17.2,2.9,2.3,4.2,60,D
16.5,3.0,2.4,4.0,58,D
```

---

## 🧪 Testing & Validation

### Dataset Validation
The dataset includes built-in validation to ensure data quality:
- DRC percentage: 0-100%
- Moisture content: 0-100%
- Impurities: 0-100%
- Color score: 0-10
- Viscosity: > 0
- Quality grade: A, B, C, or D

### Model Performance

Expected accuracy with K=3:
- **Overall Accuracy**: 90-95%
- **Grade A Precision**: 92-95%
- **Grade B Precision**: 88-92%
- **Grade C Precision**: 88-92%
- **Grade D Precision**: 90-94%

### Confusion Matrix Example
```
     Predicted →
Actual ↓  |   A  |   B  |   C  |   D  |
----------|------|------|------|------|
   A      |  14  |   1  |   0  |   0  |
   B      |   1  |  11  |   1  |   0  |
   C      |   0  |   1  |  11  |   1  |
   D      |   0  |   0  |   1  |  13  |
```

---

## 🔧 Customizing the Dataset

### Adding New Records

1. **Manual Entry** - Add to CSV file:
```csv
36.5,0.45,0.28,9.2,117,A
```

2. **Programmatic** - Use DatasetLoader:
```javascript
const loader = new DatasetLoader();
loader.loadCSV();
// Add new record
loader.data.push({
  drcPercentage: 36.5,
  moistureContent: 0.45,
  impurities: 0.28,
  colorScore: 9.2,
  viscosity: 117,
  qualityGrade: 'A'
});
```

### Exporting Dataset

```javascript
const loader = new DatasetLoader();
loader.loadCSV();

// Export to JSON
loader.exportToJSON('./datasets/polymer_quality_data.json');
```

---

## 📝 API Integration

### Using Dataset in Controller

```javascript
// In server/controllers/knnController.js
const DatasetLoader = require('../../utils/datasetLoader');

exports.classifyQuality = async (req, res) => {
  try {
    const { drcPercentage, moistureContent, impurities, colorScore, viscosity } = req.body;

    // Load dataset
    const loader = new DatasetLoader();
    const trainingData = loader.getAllData();

    // Train model
    const qualityModel = new QualityClassificationKNN(3);
    qualityModel.trainQualityModel(trainingData);

    // Make prediction
    const prediction = qualityModel.classifyQuality(
      drcPercentage,
      moistureContent,
      impurities,
      colorScore,
      viscosity
    );

    res.json({
      success: true,
      classification: {
        qualityGrade: prediction.label,
        confidence: prediction.confidence,
        neighbors: prediction.neighbors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

---

## 🎯 Best Practices

### 1. Data Collection
- Collect real production data regularly
- Ensure balanced distribution across grades
- Validate all measurements before adding to dataset
- Include edge cases and boundary samples

### 2. Model Training
- Use 80/20 or 70/30 train/test split
- Shuffle data before splitting
- Cross-validate to find optimal K value
- Retrain model periodically with new data

### 3. Production Use
- Monitor prediction accuracy
- Log misclassifications for review
- Update dataset with verified samples
- A/B test different K values

### 4. Data Quality
- Remove duplicate entries
- Handle missing values appropriately
- Normalize features if needed
- Audit dataset quarterly

---

## 🔄 Dataset Maintenance

### Regular Updates
1. **Weekly**: Review new production data
2. **Monthly**: Validate and add verified samples
3. **Quarterly**: Audit dataset quality
4. **Annually**: Rebalance grade distribution

### Version Control
```bash
# Track dataset changes
git add datasets/polymer_quality_training_data.csv
git commit -m "Update: Added 50 new Grade A samples from Q4 production"
```

---

## 📚 Additional Resources

- [KNN Algorithm Documentation](./KNN_ALGORITHM_DOCUMENTATION.md)
- [Decision Tree vs KNN Comparison](./DECISION_TREE_IMPLEMENTATION.md)
- [API Testing Guide](./TESTING_GUIDE.md)

---

## 🆘 Troubleshooting

### Issue: Low Accuracy
**Solution**: 
- Increase training data size
- Try different K values
- Check data quality and remove outliers

### Issue: Biased Predictions
**Solution**:
- Ensure balanced grade distribution
- Add more samples for underrepresented grades

### Issue: Memory Errors
**Solution**:
- Reduce dataset size
- Use batch processing
- Implement data streaming

---

## 📞 Support

For questions or issues with the dataset:
1. Check the troubleshooting section
2. Review test results
3. Validate dataset integrity
4. Contact development team

---

**Last Updated**: October 30, 2025
**Dataset Version**: 1.0
**Total Records**: 250 samples





