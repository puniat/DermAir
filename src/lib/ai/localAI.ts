import * as tf from '@tensorflow/tfjs';

export interface SkinAnalysisResult {
  condition: string;
  severity: number; // 0-10 scale
  confidence: number; // 0-1 scale
  recommendations: string[];
  similarCases: number;
}

export interface TrainingData {
  id: string;
  imageData: ImageData;
  condition: string;
  severity: number;
  weatherConditions?: any;
  treatmentOutcome?: 'improved' | 'unchanged' | 'worsened';
  userFeedback?: number; // 1-5 rating
  timestamp: Date;
}

export class LocalDermatologyAI {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private trainingQueue: TrainingData[] = [];
  
  async initialize(): Promise<void> {
    try {
      // Try to load existing model
      this.model = await tf.loadLayersModel('localstorage://dermair-ai-model');
      this.isModelLoaded = true;
    } catch (error) {
      await this.createNewModel();
    }
  }
  
  private async createNewModel(): Promise<void> {
    // Lightweight MobileNet-inspired architecture
    this.model = tf.sequential({
      layers: [
        // Input layer for 224x224 RGB images
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          inputShape: [224, 224, 3],
          name: 'conv1'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv2'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          name: 'conv3'
        }),
        tf.layers.globalAveragePooling2d({}),
        
        // Feature extraction
        tf.layers.dense({
          units: 256,
          activation: 'relu',
          name: 'features'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        
        // Classification layers
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'classifier'
        }),
        tf.layers.dense({
          units: 8, // Skin conditions: eczema, psoriasis, dermatitis, acne, normal, etc.
          activation: 'softmax',
          name: 'output'
        })
      ]
    });
    
    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.isModelLoaded = true;
  }
  
  async analyzeImage(imageFile: File, userContext?: {
    weather?: any;
    symptoms?: string[];
    medication?: string[];
  }): Promise<SkinAnalysisResult> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('AI model not loaded');
    }
    
    try {
      // Preprocess image
      const imageData = await this.preprocessImage(imageFile);
      
      // Run prediction
      const prediction = this.model.predict(imageData) as tf.Tensor;
      const scores = Array.from(await prediction.data());
      
      // Get top prediction
      const maxIndex = scores.indexOf(Math.max(...scores));
      const confidence = scores[maxIndex];
      
      const conditions = ['normal', 'eczema', 'psoriasis', 'dermatitis', 'acne', 'rosacea', 'seborrheic', 'unknown'];
      const detectedCondition = conditions[maxIndex];
      
      // Calculate severity based on confidence and visual features
      const severity = this.calculateSeverity(scores, userContext);
      
      // Generate contextual recommendations
      const recommendations = this.generateRecommendations(
        detectedCondition,
        severity,
        userContext
      );
      
      // Clean up tensors
      prediction.dispose();
      imageData.dispose();
      
      return {
        condition: detectedCondition,
        severity,
        confidence,
        recommendations,
        similarCases: this.getSimilarCasesCount(detectedCondition)
      };
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        condition: 'unknown',
        severity: 0,
        confidence: 0,
        recommendations: ['Please consult with a healthcare professional for accurate diagnosis'],
        similarCases: 0
      };
    }
  }
  
  private async preprocessImage(imageFile: File): Promise<tf.Tensor> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d')!;
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, 224, 224);
        
        // Convert to tensor
        const imageData = ctx.getImageData(0, 0, 224, 224);
        const tensor = tf.browser.fromPixels(imageData)
          .expandDims(0)
          .div(255.0); // Normalize to 0-1
        
        resolve(tensor);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }
  
  private calculateSeverity(scores: number[], userContext?: any): number {
    // Base severity from model confidence
    const maxScore = Math.max(...scores);
    let severity = Math.round(maxScore * 10);
    
    // Adjust based on user symptoms
    if (userContext?.symptoms) {
      const symptomSeverity = userContext.symptoms.length * 1.5;
      severity = Math.min(10, severity + symptomSeverity);
    }
    
    return Math.max(0, Math.min(10, severity));
  }
  
  private generateRecommendations(
    condition: string,
    severity: number,
    userContext?: any
  ): string[] {
    const baseRecommendations: Record<string, string[]> = {
      eczema: [
        'Apply fragrance-free moisturizer twice daily',
        'Avoid known triggers and allergens',
        'Use lukewarm water for bathing',
        'Consider anti-inflammatory treatments'
      ],
      psoriasis: [
        'Maintain consistent skincare routine',
        'Protect skin from sun exposure',
        'Consider stress management techniques',
        'Stay hydrated and maintain healthy diet'
      ],
      dermatitis: [
        'Identify and avoid irritants',
        'Use gentle, hypoallergenic products',
        'Apply cool compresses for relief',
        'Maintain skin barrier with moisturizers'
      ],
      acne: [
        'Use non-comedogenic skincare products',
        'Maintain consistent cleansing routine',
        'Avoid picking or touching affected areas',
        'Consider dietary factors'
      ],
      normal: [
        'Maintain current skincare routine',
        'Continue protective measures',
        'Monitor for any changes',
        'Stay consistent with prevention'
      ]
    };
    
    let recommendations = baseRecommendations[condition] || baseRecommendations.normal;
    
    // Add severity-based recommendations
    if (severity > 7) {
      recommendations.unshift('Consider consulting a dermatologist for severe symptoms');
    } else if (severity > 4) {
      recommendations.push('Monitor symptoms closely and track improvements');
    }
    
    // Add weather-based recommendations
    if (userContext?.weather) {
      const weather = userContext.weather;
      if (weather.humidity > 80) {
        recommendations.push('High humidity detected - use lighter moisturizers');
      }
      if (weather.uv_index > 6) {
        recommendations.push('High UV - use broad-spectrum SPF 30+ sunscreen');
      }
    }
    
    return recommendations;
  }
  
  private getSimilarCasesCount(condition: string): number {
    // Simulate similar cases count based on training data
    const baseCases: Record<string, number> = {
      eczema: 150,
      psoriasis: 120,
      dermatitis: 200,
      acne: 300,
      normal: 500,
      rosacea: 80,
      seborrheic: 90,
      unknown: 10
    };
    
    return baseCases[condition] || 0;
  }
  
  async addTrainingData(data: TrainingData): Promise<void> {
    // Add to training queue
    this.trainingQueue.push(data);
    
    // Auto-train when we have enough new data
    if (this.trainingQueue.length >= 10) {
      await this.retrainModel();
    }
  }
  
  private async retrainModel(): Promise<void> {
    if (!this.model || this.trainingQueue.length === 0) return;
    
    
    try {
      // Prepare training data
      const { inputs, labels } = await this.prepareTrainingData(this.trainingQueue);
      
      // Retrain model
      await this.model.fit(inputs, labels, {
        epochs: 5,
        batchSize: Math.min(16, this.trainingQueue.length),
        shuffle: true,
        validationSplit: 0.1
      });
      
      // Save updated model
      await this.saveModel();
      
      // Clear training queue
      this.trainingQueue = [];
      
    } catch (error) {
      console.error('Model retraining failed:', error);
    }
  }
  
  private async prepareTrainingData(data: TrainingData[]): Promise<{
    inputs: tf.Tensor;
    labels: tf.Tensor;
  }> {
    // This is a simplified version - in practice, you'd need more sophisticated data preparation
    const conditions = ['normal', 'eczema', 'psoriasis', 'dermatitis', 'acne', 'rosacea', 'seborrheic', 'unknown'];
    
    const inputTensors: tf.Tensor[] = [];
    const labelTensors: number[][] = [];
    
    for (const sample of data) {
      // Convert image data to tensor (simplified)
      const imageTensor = tf.browser.fromPixels(sample.imageData).div(255.0);
      inputTensors.push(imageTensor);
      
      // One-hot encode labels
      const labelIndex = conditions.indexOf(sample.condition);
      const oneHot = new Array(conditions.length).fill(0);
      oneHot[labelIndex] = 1;
      labelTensors.push(oneHot);
    }
    
    const inputs = tf.stack(inputTensors);
    const labels = tf.tensor2d(labelTensors);
    
    // Clean up individual tensors
    inputTensors.forEach(t => t.dispose());
    
    return { inputs, labels };
  }
  
  async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      await this.model.save('localstorage://dermair-ai-model');
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  }
  
  getModelInfo(): {
    isLoaded: boolean;
    version: string;
    trainingQueueSize: number;
    lastTraining?: Date;
  } {
    return {
      isLoaded: this.isModelLoaded,
      version: '1.0.0',
      trainingQueueSize: this.trainingQueue.length,
      lastTraining: new Date() // In practice, track this properly
    };
  }
}

// Singleton instance
export const localAI = new LocalDermatologyAI();