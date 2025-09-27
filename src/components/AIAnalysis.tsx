"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { localAI, SkinAnalysisResult } from '@/lib/ai/localAI';
import { Camera, Upload, Brain, Zap } from 'lucide-react';

interface AIAnalysisProps {
  onClose: () => void;
  weatherData?: any;
  userProfile?: any;
}

export function AIAnalysis({ onClose, weatherData, userProfile }: AIAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const symptomOptions = [
    'Itching', 'Redness', 'Swelling', 'Dry skin', 'Flaking', 
    'Burning sensation', 'Tenderness', 'Scaling', 'Cracking', 'Bleeding'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      analyzeImage(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUploadMethod('camera');
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'skin-photo.jpg', { type: 'image/jpeg' });
          setImagePreview(canvas.toDataURL());
          analyzeImage(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    
    try {
      // Initialize AI if not already done
      if (!localAI.getModelInfo().isLoaded) {
        await localAI.initialize();
      }
      
      const userContext = {
        weather: weatherData,
        symptoms: symptoms,
        medication: userProfile?.medication || []
      };
      
      const result = await localAI.analyzeImage(imageFile, userContext);
      setAnalysisResult(result);
      
      // Add this analysis to training data (with user consent)
      // This would be implemented based on user privacy settings
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({
        condition: 'error',
        severity: 0,
        confidence: 0,
        recommendations: ['Analysis failed. Please try again or consult a healthcare professional.'],
        similarCases: 0
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      normal: 'text-green-600 bg-green-50 border-green-200',
      eczema: 'text-orange-600 bg-orange-50 border-orange-200',
      psoriasis: 'text-red-600 bg-red-50 border-red-200',
      dermatitis: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      acne: 'text-purple-600 bg-purple-50 border-purple-200',
      rosacea: 'text-pink-600 bg-pink-50 border-pink-200',
      unknown: 'text-gray-600 bg-gray-50 border-gray-200',
      error: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[condition] || colors.unknown;
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-100';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Skin Analysis
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
            ×
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {!analysisResult && !isAnalyzing && !uploadMethod && (
            <>
              {/* Upload Method Selection */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Skin Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Upload a photo of your skin for AI-powered analysis and personalized recommendations.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload File</span>
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {/* Symptoms Selection */}
              <div>
                <h4 className="font-medium mb-3">Current Symptoms (Optional)</h4>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => (
                    <Button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      variant={symptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Camera View */}
          {uploadMethod === 'camera' && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 justify-center">
                <Button onClick={capturePhoto} className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </Button>
                <Button onClick={() => { stopCamera(); setUploadMethod(null); }} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Analyzing Image...</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI is examining your photo and generating personalized recommendations.
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="text-center">
              <img 
                src={imagePreview} 
                alt="Skin analysis" 
                className="max-w-full max-h-64 rounded-lg mx-auto object-contain border"
              />
            </div>
          )}
          
          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Analysis Results
                    <Badge variant="outline" className="text-xs">
                      AI Powered
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Condition & Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${getConditionColor(analysisResult.condition)}`}>
                      <div className="text-sm font-medium">Detected Condition</div>
                      <div className="text-lg font-bold capitalize">
                        {analysisResult.condition}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="text-sm font-medium text-blue-600">Confidence</div>
                      <div className="text-lg font-bold text-blue-700">
                        {Math.round(analysisResult.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Severity */}
                  <div className={`p-3 rounded-lg ${getSeverityColor(analysisResult.severity)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Severity Level</span>
                      <Badge variant="outline" className="text-xs">
                        {analysisResult.severity}/10
                      </Badge>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                      <div 
                        className="bg-current h-2 rounded-full transition-all"
                        style={{ width: `${(analysisResult.severity / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Similar Cases */}
                  {analysisResult.similarCases > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Based on analysis of {analysisResult.similarCases} similar cases
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setAnalysisResult(null);
                    setImagePreview(null);
                    setUploadMethod(null);
                  }}
                  variant="outline" 
                  className="flex-1"
                >
                  Analyze Another
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
            Always consult with a healthcare provider for proper diagnosis and treatment.
          </div>
        </div>
      </div>
    </div>
  );
}