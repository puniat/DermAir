"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getRiskColor } from "@/lib/utils";
import { RiskGaugeProps } from "@/types";

export function RiskGauge({ riskLevel, riskScore, recommendations, className }: RiskGaugeProps) {
  const colors = getRiskColor(riskLevel);
  
  // Calculate the angle for the gauge needle (0-180 degrees)
  const needleAngle = (riskScore / 100) * 180;
  
  const getGaugeColor = () => {
    switch (riskLevel) {
      case "low":
        return "#22c55e"; // green-500
      case "medium":
        return "hsl(var(--warning))";
      case "high":
        return "hsl(var(--destructive))";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Today&apos;s Skin Risk</h2>
            <p className="text-sm text-muted-foreground">
              Based on weather conditions and your profile
            </p>
          </div>

          {/* Gauge */}
          <div className="relative mx-auto w-48 h-24 overflow-hidden">
            {/* Background semicircle */}
            <div className="absolute inset-0 w-48 h-24 border-b-8 border-l-8 border-r-8 border-muted rounded-t-full" />
            
            {/* Colored gauge sections */}
            <div className="absolute inset-0 w-48 h-24">
              {/* Low risk section (green) */}
              <div 
                className="absolute inset-0 w-16 h-24 border-b-4 border-green-500 rounded-tl-full origin-bottom-right"
                style={{ 
                  clipPath: "polygon(100% 100%, 0% 100%, 50% 0%)",
                  transform: "rotate(0deg)",
                }}
              />
              {/* Medium risk section (orange) */}
              <div 
                className="absolute inset-0 w-16 h-24 border-b-4 border-warning origin-bottom-left"
                style={{ 
                  clipPath: "polygon(0% 100%, 100% 100%, 50% 0%)",
                  left: "50%",
                  transform: "rotate(0deg)",
                }}
              />
              {/* High risk section (red) */}
              <div 
                className="absolute inset-0 w-16 h-24 border-b-4 border-destructive rounded-tr-full origin-bottom-left"
                style={{ 
                  clipPath: "polygon(0% 100%, 100% 100%, 0% 0%)",
                  right: "0%",
                  transform: "rotate(0deg)",
                }}
              />
            </div>
            
            {/* Needle */}
            <motion.div
              className="absolute bottom-0 left-1/2 w-0.5 bg-foreground origin-bottom"
              style={{ height: "80px" }}
              initial={{ rotate: 0 }}
              animate={{ rotate: needleAngle - 90 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Center dot */}
            <div 
              className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 translate-y-1/2"
              style={{ backgroundColor: getGaugeColor() }}
            />
          </div>

          {/* Risk Level Display */}
          <div className={cn("inline-flex items-center px-4 py-2 rounded-full", colors.bg, colors.border)}>
            <div className={cn("w-2 h-2 rounded-full mr-2", colors.text)} style={{ backgroundColor: getGaugeColor() }} />
            <span className={cn("font-semibold capitalize", colors.text)}>
              {riskLevel} Risk ({riskScore}/100)
            </span>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Recommended Actions
              </h3>
              <div className="space-y-2">
                {recommendations.slice(0, 2).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.2 }}
                    className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-foreground">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}