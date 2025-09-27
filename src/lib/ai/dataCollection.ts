/**
 * Data Collection Service for Training Local AI Model
 * Handles fetching and preprocessing skin condition datasets from various sources
 */

export interface DatasetSource {
  name: string;
  url: string;
  type: 'api' | 'scrape' | 'static';
  conditions: string[];
  imageCount: number;
  license: string;
}

export interface SkinImageData {
  id: string;
  imageUrl: string;
  condition: string;
  severity?: number;
  metadata: {
    source: string;
    verified: boolean;
    resolution: string;
    diagnosis: string;
    ageGroup?: string;
    skinType?: string;
  };
}

class DataCollectionService {
  private datasets: DatasetSource[] = [
    {
      name: 'HAM10000',
      url: 'https://dataverse.harvard.edu/api/access/dataset/HAM10000',
      type: 'api',
      conditions: ['melanoma', 'melanocytic-nevi', 'basal-cell-carcinoma', 'actinic-keratoses', 'benign-keratoses', 'dermatofibroma', 'vascular-lesions'],
      imageCount: 10015,
      license: 'CC-BY-NC-4.0'
    },
    {
      name: 'ISIC Archive',
      url: 'https://www.isic-archive.com/api/v1/',
      type: 'api',
      conditions: ['melanoma', 'nevus', 'seborrheic-keratosis', 'basal-cell-carcinoma'],
      imageCount: 13000,
      license: 'CC-0'
    },
    {
      name: 'DermNet',
      url: 'https://dermnet.com',
      type: 'scrape',
      conditions: ['eczema', 'psoriasis', 'dermatitis', 'acne', 'rosacea'],
      imageCount: 23000,
      license: 'Educational Use'
    },
    {
      name: 'PAD-UFES-20',
      url: 'https://data.mendeley.com/datasets/zr7vgbcyr2/1',
      type: 'static',
      conditions: ['actinic-keratosis', 'basal-cell-carcinoma', 'melanoma', 'nevus', 'seborrheic-keratosis', 'squamous-cell-carcinoma'],
      imageCount: 2298,
      license: 'CC-BY-4.0'
    }
  ];

  private trainingData: SkinImageData[] = [];
  private isCollecting = false;

  async initializeDataCollection(): Promise<void> {
    console.log('🔄 Initializing data collection service...');
    
    // Check for existing cached data
    const cachedData = localStorage.getItem('dermair-training-data');
    if (cachedData) {
      try {
        this.trainingData = JSON.parse(cachedData);
        console.log(`✅ Loaded ${this.trainingData.length} cached training samples`);
      } catch (error) {
        console.error('❌ Failed to load cached training data:', error);
      }
    }
  }

  async collectDataFromSources(maxSamplesPerSource = 100): Promise<void> {
    if (this.isCollecting) {
      console.log('⚠️ Data collection already in progress');
      return;
    }

    this.isCollecting = true;
    console.log('🔄 Starting data collection from multiple sources...');
    console.log('ℹ️ Using synthetic demo data - configure real data sources for production use');

    try {
      for (const dataset of this.datasets) {
        console.log(`📥 Collecting from ${dataset.name}...`);
        
        try {
          const samples = await this.collectFromDataset(dataset, maxSamplesPerSource);
          this.trainingData.push(...samples);
          console.log(`✅ Collected ${samples.length} samples from ${dataset.name}`);
        } catch (error) {
          console.error(`❌ Failed to collect from ${dataset.name}:`, error);
        }
        
        // Add delay between requests to be respectful
        await this.delay(1000);
      }

      // Cache the collected data
      await this.cacheTrainingData();
      console.log(`✅ Data collection complete: ${this.trainingData.length} total samples`);
      
    } catch (error) {
      console.error('❌ Data collection failed:', error);
    } finally {
      this.isCollecting = false;
    }
  }

  private async collectFromDataset(dataset: DatasetSource, maxSamples: number): Promise<SkinImageData[]> {
    switch (dataset.type) {
      case 'api':
        return this.collectFromAPI(dataset, maxSamples);
      case 'scrape':
        return this.collectFromScraping(dataset, maxSamples);
      case 'static':
        return this.collectFromStaticDataset(dataset, maxSamples);
      default:
        throw new Error(`Unsupported dataset type: ${dataset.type}`);
    }
  }

  private async collectFromAPI(dataset: DatasetSource, maxSamples: number): Promise<SkinImageData[]> {
    // For demo purposes, we'll use synthetic data instead of real API calls
    // Real API integration would require proper authentication and configuration
    console.log(`🔄 Collecting data from ${dataset.name} API (using synthetic data for demo)`);
    
    // Skip real API calls and generate synthetic data immediately
    // This prevents network errors and works without external dependencies
    return this.generateSyntheticData(dataset, maxSamples);
  }

  private async collectFromScraping(dataset: DatasetSource, maxSamples: number): Promise<SkinImageData[]> {
    const samples: SkinImageData[] = [];
    
    // Note: In production, this would need proper scraping with respect to robots.txt
    // and terms of service. For now, we'll return simulated data.
    
    console.log(`📝 Simulating scraping from ${dataset.name} (${maxSamples} samples)`);
    
    for (let i = 0; i < Math.min(maxSamples, 10); i++) {
      const condition = dataset.conditions[i % dataset.conditions.length];
      samples.push({
        id: `${dataset.name.toLowerCase()}-${i}`,
        imageUrl: `https://example.com/images/${condition}-${i}.jpg`, // Placeholder
        condition: condition,
        severity: Math.floor(Math.random() * 10) + 1,
        metadata: {
          source: dataset.name,
          verified: false, // Scraped data needs manual verification
          resolution: '512x512',
          diagnosis: condition,
          ageGroup: ['20s', '30s', '40s', '50s'][Math.floor(Math.random() * 4)],
          skinType: ['fair', 'medium', 'dark'][Math.floor(Math.random() * 3)]
        }
      });
    }
    
    return samples;
  }

  private async collectFromStaticDataset(dataset: DatasetSource, maxSamples: number): Promise<SkinImageData[]> {
    const samples: SkinImageData[] = [];
    
    // This would typically involve downloading and processing static dataset files
    console.log(`📁 Processing static dataset ${dataset.name}`);
    
    // Simulate processing static dataset
    for (let i = 0; i < Math.min(maxSamples, 20); i++) {
      const condition = dataset.conditions[i % dataset.conditions.length];
      samples.push({
        id: `${dataset.name.toLowerCase()}-static-${i}`,
        imageUrl: `data/${dataset.name.toLowerCase()}/${condition}_${i}.jpg`,
        condition: condition,
        severity: Math.floor(Math.random() * 10) + 1,
        metadata: {
          source: dataset.name,
          verified: true, // Academic datasets are usually verified
          resolution: '1024x1024',
          diagnosis: condition,
          ageGroup: ['adult', 'elderly'][Math.floor(Math.random() * 2)],
          skinType: 'various'
        }
      });
    }
    
    return samples;
  }

  private mapISICDiagnosis(diagnosis?: string): string {
    const mapping: Record<string, string> = {
      'benign': 'benign-lesion',
      'malignant': 'malignant-lesion',
      'melanoma': 'melanoma',
      'nevus': 'nevus',
      'seborrheic keratosis': 'seborrheic-keratosis'
    };
    
    return mapping[diagnosis?.toLowerCase() || ''] || 'unknown';
  }

  private async cacheTrainingData(): Promise<void> {
    try {
      // Only cache metadata, not actual images (too large)
      const cacheData = this.trainingData.map(item => ({
        ...item,
        imageUrl: item.imageUrl.includes('data/') ? item.imageUrl : 'cached' // Keep local paths
      }));
      
      localStorage.setItem('dermair-training-data', JSON.stringify(cacheData));
      localStorage.setItem('dermair-training-data-timestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to cache training data:', error);
    }
  }

  async preprocessTrainingData(): Promise<{ processed: number; skipped: number }> {
    console.log('🔄 Preprocessing training data...');
    
    let processed = 0;
    let skipped = 0;
    
    for (const sample of this.trainingData) {
      try {
        // Validate image URL
        if (!sample.imageUrl || sample.imageUrl === 'cached') {
          skipped++;
          continue;
        }
        
        // Validate condition mapping
        if (!this.isValidCondition(sample.condition)) {
          sample.condition = 'unknown';
        }
        
        // Ensure severity is in valid range
        if (sample.severity && (sample.severity < 0 || sample.severity > 10)) {
          sample.severity = Math.min(10, Math.max(0, sample.severity));
        }
        
        processed++;
      } catch (error) {
        console.error(`Preprocessing error for sample ${sample.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`✅ Preprocessing complete: ${processed} processed, ${skipped} skipped`);
    return { processed, skipped };
  }

  private isValidCondition(condition: string): boolean {
    const validConditions = [
      'normal', 'eczema', 'psoriasis', 'dermatitis', 'acne', 
      'rosacea', 'seborrheic-keratosis', 'melanoma', 'nevus', 
      'basal-cell-carcinoma', 'squamous-cell-carcinoma', 'unknown'
    ];
    
    return validConditions.includes(condition);
  }

  getTrainingData(): SkinImageData[] {
    return this.trainingData;
  }

  getDatasetInfo(): {
    totalSamples: number;
    conditionBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    verifiedSamples: number;
  } {
    const conditionBreakdown: Record<string, number> = {};
    const sourceBreakdown: Record<string, number> = {};
    let verifiedSamples = 0;

    for (const sample of this.trainingData) {
      // Count conditions
      conditionBreakdown[sample.condition] = (conditionBreakdown[sample.condition] || 0) + 1;
      
      // Count sources
      sourceBreakdown[sample.metadata.source] = (sourceBreakdown[sample.metadata.source] || 0) + 1;
      
      // Count verified samples
      if (sample.metadata.verified) {
        verifiedSamples++;
      }
    }

    return {
      totalSamples: this.trainingData.length,
      conditionBreakdown,
      sourceBreakdown,
      verifiedSamples
    };
  }

  private async generateSyntheticData(dataset: DatasetSource, maxSamples: number): Promise<SkinImageData[]> {
    const samples: SkinImageData[] = [];
    console.log(`📝 Generating synthetic training data for ${dataset.name} (${maxSamples} samples)`);
    
    const conditions = dataset.conditions || ['normal', 'acne', 'eczema', 'psoriasis', 'melanoma'];
    
    // Create realistic demo skin condition images using placeholder service
    const colors = {
      'melanoma': 'd4a574', // Brown
      'acne': 'ff9999', // Light red  
      'eczema': 'ffcccc', // Pink
      'psoriasis': 'ff6666', // Red
      'normal': 'f4d2b7', // Normal skin tone
      'nevus': '8b4513', // Dark brown
      'basal-cell-carcinoma': 'cd853f', // Peru
      'seborrheic-keratosis': 'daa520', // Goldenrod
      'dermatitis': 'ffa07a', // Light salmon
      'rosacea': 'fa8072' // Salmon
    };
    
    for (let i = 0; i < Math.min(maxSamples, 20); i++) {
      const condition = conditions[i % conditions.length];
      const color = colors[condition as keyof typeof colors] || 'f4d2b7';
      
      samples.push({
        id: `demo-${dataset.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        imageUrl: `https://via.placeholder.com/512x512/${color}/ffffff?text=${encodeURIComponent(condition.toUpperCase().replace(/-/g, ' '))}`,
        condition: condition,
        metadata: {
          source: `${dataset.name} (Demo Data)`,
          verified: false, // Mark as synthetic for transparency
          resolution: '512x512',
          diagnosis: condition,
          ageGroup: `${20 + (i % 6) * 10}s`,
          skinType: ['fitzpatrick-1', 'fitzpatrick-2', 'fitzpatrick-3', 'fitzpatrick-4', 'fitzpatrick-5', 'fitzpatrick-6'][i % 6]
        }
      });
    }
    
    // Add a small delay to simulate data collection process
    await this.delay(300 + Math.random() * 700);
    
    console.log(`✅ Generated ${samples.length} synthetic training samples from ${dataset.name}`);
    return samples;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async clearCache(): Promise<void> {
    localStorage.removeItem('dermair-training-data');
    localStorage.removeItem('dermair-training-data-timestamp');
    this.trainingData = [];
    console.log('✅ Training data cache cleared');
  }
}

// Export singleton instance
export const dataCollectionService = new DataCollectionService();