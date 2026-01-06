/**
 * Dataset Loader for KNN Quality Classifier
 * Loads and processes polymer quality training data
 */

const fs = require('fs');
const path = require('path');

class DatasetLoader {
  constructor(datasetPath = null) {
    this.datasetPath = datasetPath || path.join(__dirname, '../datasets/polymer_quality_training_data.csv');
    this.data = [];
  }

  /**
   * Load CSV dataset
   */
  loadCSV() {
    try {
      const csvContent = fs.readFileSync(this.datasetPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const record = {
          drcPercentage: parseFloat(values[0]),
          moistureContent: parseFloat(values[1]),
          impurities: parseFloat(values[2]),
          colorScore: parseFloat(values[3]),
          viscosity: parseFloat(values[4]),
          qualityGrade: values[5].trim()
        };
        this.data.push(record);
      }

      console.log(`✅ Loaded ${this.data.length} records from dataset`);
      return this.data;
    } catch (error) {
      console.error('❌ Error loading dataset:', error.message);
      return [];
    }
  }

  /**
   * Get all data
   */
  getAllData() {
    if (this.data.length === 0) {
      this.loadCSV();
    }
    return this.data;
  }

  /**
   * Filter data by quality grade
   */
  getDataByGrade(grade) {
    if (this.data.length === 0) {
      this.loadCSV();
    }
    return this.data.filter(record => record.qualityGrade === grade);
  }

  /**
   * Split data into training and testing sets
   */
  splitData(testSize = 0.2, shuffle = true) {
    if (this.data.length === 0) {
      this.loadCSV();
    }

    let dataToSplit = [...this.data];

    // Shuffle if requested
    if (shuffle) {
      for (let i = dataToSplit.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dataToSplit[i], dataToSplit[j]] = [dataToSplit[j], dataToSplit[i]];
      }
    }

    const splitIndex = Math.floor(dataToSplit.length * (1 - testSize));
    const trainingData = dataToSplit.slice(0, splitIndex);
    const testingData = dataToSplit.slice(splitIndex);

    return {
      training: trainingData,
      testing: testingData,
      trainSize: trainingData.length,
      testSize: testingData.length
    };
  }

  /**
   * Get dataset statistics
   */
  getStatistics() {
    if (this.data.length === 0) {
      this.loadCSV();
    }

    const stats = {
      totalRecords: this.data.length,
      gradeDistribution: {},
      drcRange: { min: Infinity, max: -Infinity, avg: 0 },
      moistureRange: { min: Infinity, max: -Infinity, avg: 0 },
      impuritiesRange: { min: Infinity, max: -Infinity, avg: 0 },
      colorScoreRange: { min: Infinity, max: -Infinity, avg: 0 },
      viscosityRange: { min: Infinity, max: -Infinity, avg: 0 }
    };

    let drcSum = 0, moistureSum = 0, impuritiesSum = 0, colorSum = 0, viscositySum = 0;

    this.data.forEach(record => {
      // Grade distribution
      stats.gradeDistribution[record.qualityGrade] = (stats.gradeDistribution[record.qualityGrade] || 0) + 1;

      // DRC
      stats.drcRange.min = Math.min(stats.drcRange.min, record.drcPercentage);
      stats.drcRange.max = Math.max(stats.drcRange.max, record.drcPercentage);
      drcSum += record.drcPercentage;

      // Moisture
      stats.moistureRange.min = Math.min(stats.moistureRange.min, record.moistureContent);
      stats.moistureRange.max = Math.max(stats.moistureRange.max, record.moistureContent);
      moistureSum += record.moistureContent;

      // Impurities
      stats.impuritiesRange.min = Math.min(stats.impuritiesRange.min, record.impurities);
      stats.impuritiesRange.max = Math.max(stats.impuritiesRange.max, record.impurities);
      impuritiesSum += record.impurities;

      // Color Score
      stats.colorScoreRange.min = Math.min(stats.colorScoreRange.min, record.colorScore);
      stats.colorScoreRange.max = Math.max(stats.colorScoreRange.max, record.colorScore);
      colorSum += record.colorScore;

      // Viscosity
      stats.viscosityRange.min = Math.min(stats.viscosityRange.min, record.viscosity);
      stats.viscosityRange.max = Math.max(stats.viscosityRange.max, record.viscosity);
      viscositySum += record.viscosity;
    });

    // Calculate averages
    stats.drcRange.avg = (drcSum / this.data.length).toFixed(2);
    stats.moistureRange.avg = (moistureSum / this.data.length).toFixed(2);
    stats.impuritiesRange.avg = (impuritiesSum / this.data.length).toFixed(2);
    stats.colorScoreRange.avg = (colorSum / this.data.length).toFixed(2);
    stats.viscosityRange.avg = (viscositySum / this.data.length).toFixed(2);

    return stats;
  }

  /**
   * Print dataset statistics
   */
  printStatistics() {
    const stats = this.getStatistics();
    
    console.log('\n📊 DATASET STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total Records: ${stats.totalRecords}`);
    console.log('\n📈 Grade Distribution:');
    Object.keys(stats.gradeDistribution).sort().forEach(grade => {
      const count = stats.gradeDistribution[grade];
      const percentage = ((count / stats.totalRecords) * 100).toFixed(1);
      console.log(`  Grade ${grade}: ${count} records (${percentage}%)`);
    });

    console.log('\n📏 Feature Ranges:');
    console.log(`  DRC Percentage: ${stats.drcRange.min.toFixed(1)}% - ${stats.drcRange.max.toFixed(1)}% (avg: ${stats.drcRange.avg}%)`);
    console.log(`  Moisture: ${stats.moistureRange.min.toFixed(1)}% - ${stats.moistureRange.max.toFixed(1)}% (avg: ${stats.moistureRange.avg}%)`);
    console.log(`  Impurities: ${stats.impuritiesRange.min.toFixed(1)}% - ${stats.impuritiesRange.max.toFixed(1)}% (avg: ${stats.impuritiesRange.avg}%)`);
    console.log(`  Color Score: ${stats.colorScoreRange.min.toFixed(1)} - ${stats.colorScoreRange.max.toFixed(1)} (avg: ${stats.colorScoreRange.avg})`);
    console.log(`  Viscosity: ${stats.viscosityRange.min.toFixed(0)} - ${stats.viscosityRange.max.toFixed(0)} cP (avg: ${stats.viscosityRange.avg} cP)`);
    console.log('='.repeat(50));
  }

  /**
   * Get sample data for testing
   */
  getSampleData(count = 10, grade = null) {
    if (this.data.length === 0) {
      this.loadCSV();
    }

    let filteredData = grade ? this.getDataByGrade(grade) : this.data;
    
    // Shuffle and take random samples
    const shuffled = [...filteredData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(outputPath) {
    if (this.data.length === 0) {
      this.loadCSV();
    }

    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.data, null, 2));
      console.log(`✅ Exported ${this.data.length} records to ${outputPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error exporting to JSON:', error.message);
      return false;
    }
  }

  /**
   * Validate dataset integrity
   */
  validateDataset() {
    if (this.data.length === 0) {
      this.loadCSV();
    }

    const errors = [];
    
    this.data.forEach((record, index) => {
      // Check for valid ranges
      if (record.drcPercentage < 0 || record.drcPercentage > 100) {
        errors.push(`Record ${index + 1}: Invalid DRC percentage (${record.drcPercentage})`);
      }
      if (record.moistureContent < 0 || record.moistureContent > 100) {
        errors.push(`Record ${index + 1}: Invalid moisture content (${record.moistureContent})`);
      }
      if (record.impurities < 0 || record.impurities > 100) {
        errors.push(`Record ${index + 1}: Invalid impurities (${record.impurities})`);
      }
      if (record.colorScore < 0 || record.colorScore > 10) {
        errors.push(`Record ${index + 1}: Invalid color score (${record.colorScore})`);
      }
      if (record.viscosity < 0) {
        errors.push(`Record ${index + 1}: Invalid viscosity (${record.viscosity})`);
      }
      if (!['A', 'B', 'C', 'D'].includes(record.qualityGrade)) {
        errors.push(`Record ${index + 1}: Invalid quality grade (${record.qualityGrade})`);
      }
    });

    if (errors.length === 0) {
      console.log('✅ Dataset validation passed! No errors found.');
      return { valid: true, errors: [] };
    } else {
      console.log(`❌ Dataset validation failed! Found ${errors.length} errors.`);
      errors.slice(0, 10).forEach(error => console.log(`  - ${error}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
      return { valid: false, errors };
    }
  }
}

module.exports = DatasetLoader;

// If run directly, demonstrate functionality
if (require.main === module) {
  console.log('🧪 Testing Dataset Loader...\n');
  
  const loader = new DatasetLoader();
  loader.loadCSV();
  loader.printStatistics();
  
  console.log('\n📦 Sample Data (Grade A):');
  const samples = loader.getSampleData(5, 'A');
  console.table(samples);
  
  console.log('\n✅ Validating dataset...');
  loader.validateDataset();
  
  console.log('\n📊 Split Data (80/20):');
  const { training, testing, trainSize, testSize } = loader.splitData(0.2);
  console.log(`Training samples: ${trainSize}`);
  console.log(`Testing samples: ${testSize}`);
}





