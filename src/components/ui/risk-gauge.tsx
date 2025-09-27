"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getRiskColor } from "@/lib/utils";
import { RiskGaugeProps } from "@/types";
import { Shield, AlertTriangle, Activity } from "lucide-react";

export function RiskGauge({ riskLevel, riskScore, recommendations, className }: RiskGaugeProps) {
  const colors = getRiskColor(riskLevel);
  
  // Calculate the percentage for progress bar
  const progressPercentage = riskScore;
  
  const getGaugeColor = () => {
    switch (riskLevel) {
      case "low":
        return "rgb(34, 197, 94)"; // green-500
      case "medium":
        return "rgb(251, 146, 60)"; // orange-400
      case "high":
        return "rgb(239, 68, 68)"; // red-500
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case "low":
        return <Shield className="w-4 h-4" />;
      case "medium":
        return <Activity className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = () => {
    switch (riskLevel) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className={cn("w-full h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getRiskIcon()}
            Today's Risk
          </CardTitle>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {riskLevel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Risk assessment for your skin</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Main Risk Display - Left: Progress Bar, Right: Risk Level */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Side - Progress Bar with Score */}
            <div className="space-y-3">
              <div className="text-center">
                <motion.div 
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  style={{ color: getGaugeColor() }}
                >
                  {riskScore}
                </motion.div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
              
              {/* Horizontal Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ backgroundColor: getGaugeColor() }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">Risk Level</p>
              </div>
            </div>

            {/* Right Side - Risk Level Badge and Status */}
            <div className="flex flex-col justify-center items-center space-y-3">
              <div className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-full text-sm font-medium border-2 transition-all",
                riskLevel === "low" ? "bg-green-50 border-green-200 text-green-700" :
                riskLevel === "medium" ? "bg-orange-50 border-orange-200 text-orange-700" :
                "bg-red-50 border-red-200 text-red-700"
              )}>
                <div className="text-center">
                  {getRiskIcon()}
                  <div className="text-xs mt-1 font-bold capitalize">{riskLevel}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {riskLevel === "low" ? "• Low Risk" :
                 riskLevel === "medium" ? "• Medium Risk" :
                 "• High Risk"}
              </p>
            </div>
          </div>

          {/* Quick Actions - Compact */}
          {recommendations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground">
                QUICK ACTIONS
              </p>
              <div className="space-y-1.5">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-start gap-2 p-2 bg-primary/5 rounded-md text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">{rec}</p>
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