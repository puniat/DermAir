'use client'

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { RefreshCw, Brain, Settings } from 'lucide-react'
import { HelpDialog } from './ui/help-dialog'
import { useAIModeStore } from '@/lib/stores/ai-mode'
import type { UserProfile } from '@/types'

interface HeaderProps {
  profile: UserProfile | null
  shouldShowAlert: boolean
  onRefresh?: () => void
  onShowNotificationSettings: () => void
  onShowAnalytics: () => void
  onShowCheckIn: () => void
  onShowAccountSettings?: () => void
  hasTodaysCheckIn: boolean
}

export function Header({ 
  profile, 
  shouldShowAlert, 
  onRefresh,
  onShowNotificationSettings,
  onShowAnalytics,
  onShowCheckIn,
  onShowAccountSettings,
  hasTodaysCheckIn
}: HeaderProps) {
  const { isAIModeEnabled, toggleAIMode } = useAIModeStore()

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DermAIr Health Dashboard</h1>
                <p className="text-sm text-gray-600">Medical-grade risk assessment with personalized recommendations</p>
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
              <Button 
                onClick={onShowAnalytics} 
                variant="ghost" 
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                📊 Analytics
              </Button>
              
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
              
              {/* AI Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <Switch
                  id="ai-mode-toggle"
                  checked={isAIModeEnabled}
                  onCheckedChange={toggleAIMode}
                  
                />
                <Label htmlFor="ai-mode-toggle" className="text-sm text-gray-700 cursor-pointer">
                  AI Mode
                </Label>
              </div>
              
              <HelpDialog />
              
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              )}
              
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
        
        {/* Date/Location Row */}
        <div className="flex justify-end mt-1 pt-2 border-t border-gray-100">
          <p className="text-xs text-muted-foreground">
            {profile?.location?.city && `${profile.location.city}, `}
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