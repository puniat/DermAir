'use client'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { RefreshCw, Brain, Settings } from 'lucide-react'
import { HelpDialog } from './ui/help-dialog'
import { useAIModeStore } from '@/lib/stores/ai-mode'
import { Logo } from './Logo'
import type { UserProfile } from '@/types'

interface HeaderProps {
  profile: UserProfile | null
  shouldShowAlert: boolean
  onRefresh?: () => void
  onShowNotificationSettings: () => void
  onShowAnalytics?: () => void
  onShowCheckIn: () => void
  onShowAccountSettings?: () => void
  hasTodaysCheckIn: boolean
  riskAssessment?: {
    confidence: number
    processingTime: number
    isAdvancedMode: boolean
  }
}

export function Header({ 
  profile, 
  shouldShowAlert, 
  onRefresh,
  onShowNotificationSettings,
  onShowAnalytics,
  onShowCheckIn,
  onShowAccountSettings,
  hasTodaysCheckIn,
  riskAssessment
}: HeaderProps) {
  const { isAIModeEnabled, toggleAIMode } = useAIModeStore()

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DermAIr Health Dashboard</h1>
                <p className="text-sm text-gray-600">Smart skin care powered by AI and weather insights</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {shouldShowAlert && (
              <Badge variant="destructive" className="animate-pulse">
                Risk Alert!
              </Badge>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={onShowNotificationSettings} 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                🔔 Notifications
              </Button>
              {onShowAnalytics && (
                <Button 
                  onClick={onShowAnalytics} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  📊 Analytics
                </Button>
              )}
              
              {onShowAccountSettings && (
                <Button 
                  onClick={onShowAccountSettings} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Account
                </Button>
              )}
              
              {/* AI Mode Toggle - Hidden, always enabled */}
              {/* <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <Switch
                  id="ai-mode-toggle"
                  checked={isAIModeEnabled}
                  onCheckedChange={toggleAIMode}
                />
                <Label htmlFor="ai-mode-toggle" className="text-sm text-gray-700 cursor-pointer">
                  AI Mode
                </Label>
              </div> */}
              
              <HelpDialog />
              
              {/* {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              )} */}
              
              <Button 
                onClick={onShowCheckIn} 
                variant={hasTodaysCheckIn ? "secondary" : "default"}
                className="ml-2"
              >
                {hasTodaysCheckIn ? "✓ Update Check-in" : "Daily Check-in"}
              </Button>
            </div>
          </div>
        </div>

        {/* Username & Date/Location Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {/* Welcome Username - Left Side */}
          <div className="flex items-center gap-2">
            {profile?.username && (
              <p className="text-sm font-semibold">
                <span className="text-gray-600">Welcome,</span>{' '}
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent font-bold">
                  {profile.username}
                </span>
                {' '}
                <span className="text-lg">👋</span>
              </p>
            )}
          </div>
          
          {/* Date/Location - Right Side */}
          <p className="text-xs text-muted-foreground font-bold">
            {profile?.location?.city && `${profile.location.city}, `}
            {profile?.location?.country && `${profile.location.country} • `}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long", 
              day: "numeric",
              year: "numeric"
            })}
          </p>
        </div>
      </div>
    </div>
  )
}