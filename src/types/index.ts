// User Profile Types
export interface UserProfile {
  id: string;
  email?: string;
  age_range?: "18-25" | "26-35" | "36-45" | "46-55" | "55+";
  skin_type?: "dry" | "oily" | "combination" | "sensitive";
  known_triggers?: string[];
  triggers: string[];
  severityHistory: Array<{
    date: string;
    severity: "mild" | "moderate" | "severe";
  }>;
  preferences: {
    notifications: boolean;
    riskThreshold: "low" | "moderate" | "high";
  };
  location?: {
    city: string;
    country: string;
    zipcode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  created_at?: Date;
  research_opt_in?: boolean;
}

// Daily Log Types
export interface DailyLog {
  id: string;
  user_id: string;
  date: Date;
  itch_score: number; // 0-5
  redness_score: number; // 0-3
  medication_used: boolean;
  notes?: string;
  photo_url?: string;
  weather_data: WeatherData;
  created_at: Date;
}

// Weather Data Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  uv_index: number;
  air_quality_index: number;
  pollen_count: {
    tree: number;
    grass: number;
    weed: number;
    overall: number;
  };
  weather_condition: string;
  wind_speed: number;
  timestamp: Date;
}

// Risk Assessment Types
export interface RiskAssessment {
  date: Date;
  risk_level: "low" | "medium" | "high";
  risk_score: number; // 0-100
  contributing_factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  recommendations: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface RiskGaugeProps {
  riskLevel: "low" | "medium" | "high" | "severe";
  riskScore: number;
  recommendations: string[];
  className?: string;
}

export interface ChartDataPoint {
  date: string;
  itch_score: number;
  redness_score: number;
  humidity: number;
  pollen_count: number;
  temperature: number;
  risk_score: number;
}

// Form Types
export interface OnboardingFormData {
  email: string;
  age_range: UserProfile["age_range"];
  skin_type: UserProfile["skin_type"];
  known_triggers: string[];
  location: string;
  research_opt_in: boolean;
}

export interface DailyCheckInFormData {
  itch_score: number;
  redness_score: number;
  medication_used: boolean;
  notes?: string;
  photo?: File;
}