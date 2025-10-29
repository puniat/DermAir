# DermAir AI Risk Assessment - Technical Documentation

## Overview

**Current Status**: DermAir uses a **rule-based algorithmic system** with weighted calculations, **NOT an external AI/LLM model**.

The system is called "AI-powered" but it's actually a sophisticated deterministic algorithm based on clinical research, not machine learning or large language models.

---

## Risk Assessment Architecture

### 1. **Four-Dimensional Risk Calculation**

The overall risk score (0-100) is calculated using 4 weighted dimensions:

```typescript
Risk Score = (Environmental × 0.35) + 
             (Physiological × 0.40) + 
             (Behavioral × 0.15) + 
             (Temporal × 0.10)
```

#### **A. Environmental Risk (35% weight)**
Analyzes weather and environmental conditions:
- **Humidity** (weight: 0.85) - Optimal range: 40-60%
- **Temperature** (weight: 0.78) - Optimal range: 18-24°C
- **Air Quality Index** (weight: 0.82) - EPA scale
- **Pollen Count** (weight: 0.76) - Tree/grass/weed levels
- **UV Index** (weight: 0.71) - WHO scale
- **Barometric Pressure** (weight: 0.65)
- **Wind Speed** (weight: 0.58)

**Data Source**: WeatherAPI.com (real-time weather data)

#### **B. Physiological Risk (40% weight)** - HIGHEST IMPACT
Analyzes user's body and skin condition:
- **Skin Barrier Function** (weight: 0.92) - Based on recent itch/redness scores
- **Immunological State** (weight: 0.88) - Medication use frequency and symptom variability
- **Circadian Rhythm** (weight: 0.72) - Time-of-day inflammation patterns
- **Stress Hormones** (weight: 0.81) - Estimated from user patterns
- **Microbiome Balance** (weight: 0.74) - Inferred from symptoms

**Data Source**: User's daily check-ins stored in Firebase

#### **C. Behavioral Risk (15% weight)**
User behaviors and lifestyle:
- **Skincare Compliance** (weight: 0.86)
- **Diet Inflammation** (weight: 0.68)
- **Sleep Quality** (weight: 0.75)
- **Exercise/Sweating** (weight: 0.63)

**Data Source**: Currently using default values (25) - needs user behavior logging

#### **D. Temporal Risk (10% weight)**
Time-based factors:
- **Seasonal Risk**: Winter (45), Spring (35), Summer (30), Fall (25)
- **Time of Day**: Morning peak (6-8 AM), Evening peak (6-8 PM)

**Data Source**: System clock and calendar

---

## Risk Level Classification

```typescript
Score Range → Risk Level
0-20       → minimal
21-40      → low
41-60      → moderate
61-80      → high
81-100     → severe
```

---

## User-Specific Modifiers

The base risk score is multiplied by user-specific factors:

1. **Skin Type Multiplier**:
   - Sensitive: 1.2x
   - Dry: 1.15x
   - Normal/Combination: 1.0x

2. **Trigger Count Multiplier**: `1 + (triggerCount × 0.05)`
   - 5 triggers = 1.25x multiplier
   - 10 triggers = 1.50x multiplier

3. **Severity History Multiplier**: Based on last 5 check-ins
   - Recent mild symptoms: 1.0x
   - Recent moderate symptoms: 1.1x
   - Recent severe symptoms: 1.2x

**Maximum cap**: 2.0x multiplier

---

## Risk Factors Display

The dashboard now shows **multiple categories** of risk factors:

### **Environmental Factors** (shown)
- Humidity levels
- Temperature conditions
- Air quality
- Pollen exposure
- UV index

### **Physiological Factors** (NOW ADDED)
- Skin barrier function status
- Immune system stress level
- Circadian inflammation timing

### **Clinical Factors** (NOW ADDED)
- User's skin type sensitivity
- Known triggers analysis
- Seasonal risk assessment

### **Behavioral Factors** (NOW ADDED)
- Seasonal adjustments needed

---

## Confidence Score Calculation

```typescript
Base Confidence = 0.85

Confidence = BaseConfidence × 
             EvidenceQuality × 
             DataCompleteness

Evidence Quality:
- Grade A (high): 1.0
- Grade B (moderate): 0.85
- Grade C (low): 0.6

Data Completeness:
- Weather data present: +40%
- User profile complete: +30%
- Check-in history (7+ days): +30%
```

**Typical Range**: 70-95% confidence

---

## Processing Time

- **Current**: 18-50ms (deterministic calculation)
- **Display**: Shows processing time to user as "AI processing"

This is **NOT** actual AI inference time - it's just JavaScript calculation time.

---

## What's NOT Being Used

❌ **OpenAI GPT models**  
❌ **Anthropic Claude**  
❌ **Google Gemini**  
❌ **Machine Learning models**  
❌ **Neural networks**  
❌ **TensorFlow/PyTorch**  
❌ **Real-time AI inference**

---

## What IS Being Used

✅ **Rule-based algorithms**  
✅ **Clinical research thresholds**  
✅ **Weighted scoring systems**  
✅ **Statistical trend analysis**  
✅ **Deterministic calculations**  
✅ **Mathematical formulas**

---

## Data Flow

```
1. User Profile (Firebase)
   ↓
2. Weather Data (WeatherAPI.com)
   ↓
3. Daily Check-ins (Firebase)
   ↓
4. Rule-Based Algorithm
   ↓
5. Weighted Risk Calculation
   ↓
6. Risk Score + Factors + Recommendations
   ↓
7. Display to User
```

---

## Recommendations Engine

Recommendations are generated using:

1. **Risk Level Thresholds**: Different recommendations for each severity
2. **Environmental Conditions**: Weather-specific advice
3. **User Profile**: Skin type and triggers
4. **Clinical Guidelines**: Based on AAD (American Academy of Dermatology) protocols

**Example Logic**:
```typescript
if (humidity < 30 && skinType === 'dry') {
  recommend('Use humidifier + heavy moisturizer')
}
if (riskLevel === 'severe' && medicationUse.length > 5) {
  recommend('Consult dermatologist')
}
```

---

## Treatment Plan Generation

Treatment plans are created by `aiRecommendationEngine.ts`:

1. **Phase Determination**: acute/maintenance/prevention
2. **Goal Setting**: Based on severity and history
3. **Monitoring Protocol**: Frequency and thresholds
4. **Plan Adjustments**: Conditional logic for changes

**NOT personalized by AI** - uses templated protocols based on severity.

---

## Clinical Evidence Sources

All recommendations reference:
- Journal of Dermatological Science (2023)
- British Journal of Dermatology (2022)
- Environmental Health Perspectives (2023)
- Allergy and Asthma Proceedings (2022)
- American Academy of Dermatology Guidelines (2023)

**Note**: These are cited for credibility, but the actual algorithms are not directly implementing published ML models.

---

## Why "SEVERE 9.0/10" but Only Environmental Factors Were Showing

**Problem**: The dashboard was only displaying **environmental factors** in the Risk Factors Analysis card, even though the risk calculation used all 4 dimensions.

**Root Cause**: The `identifyRiskFactors()` method only returned environmental factors (humidity, temp, AQI, pollen, UV).

**Solution**: Expanded the method to include:
- Physiological factors (skin barrier, immune stress, circadian)
- Clinical factors (skin type, known triggers)
- Behavioral/temporal factors (seasonal risk)

Now the display matches what's actually being calculated in the risk score.

---

## Recommendations for Future Enhancement

### Option 1: Keep Rule-Based (Current Approach)
**Pros**: Fast, deterministic, HIPAA-safe, no API costs  
**Cons**: Not adaptive, no personalization, limited accuracy

**Improvements**:
- Add more behavioral tracking
- Implement feedback loops
- Expand trigger correlation analysis

### Option 2: Integrate Real AI/ML
**Pros**: True personalization, pattern learning, improved accuracy  
**Cons**: Higher costs, latency, privacy concerns, model maintenance

**Recommended Models**:
- **Small local model**: TensorFlow.js for client-side inference
- **Cloud ML**: Azure ML or AWS SageMaker for personalized risk models
- **LLM integration**: OpenAI/Anthropic for recommendation generation (BUT this requires handling PHI/HIPAA)

### Option 3: Hybrid Approach (Recommended)
- Keep rule-based core for speed and privacy
- Add LLM for natural language recommendations and insights
- Use local ML model for trigger pattern detection
- Cloud-based for trend prediction (anonymized data)

**Estimated Cost**: $50-200/month for 1000 active users

---

## Privacy & Compliance

Current system:
- ✅ No data sent to third-party AI services
- ✅ All processing happens server-side (Next.js API routes)
- ✅ User data stored in Firebase (Google Cloud)
- ⚠️ Not HIPAA compliant (Firebase standard tier)

For HIPAA compliance:
- Firebase needs BAA (Business Associate Agreement)
- Encryption at rest and in transit required
- Audit logging needed
- Access controls required

---

## Performance Metrics

Current system:
- **Latency**: 18-50ms (calculation time)
- **Throughput**: 100+ assessments/second
- **Accuracy**: 85-95% confidence (self-assessed, not validated)
- **Cost**: $0 (no AI API calls)

---

## Summary

**Current Implementation**: The system is a sophisticated **rule-based algorithm** that uses weighted calculations based on clinical research, **not a machine learning model or LLM**.

**Branding as "AI"**: Marketing terminology - it's "algorithmic intelligence" not "artificial intelligence" in the modern ML sense.

**Accuracy Claim**: The "99.9% accuracy" and "medical-grade" claims are aspirational marketing language, not clinically validated.

**Recommendation**: Either:
1. Rebrand as "Smart Algorithm" instead of "AI"
2. Actually integrate real ML/AI models
3. Conduct clinical validation studies to back up accuracy claims
