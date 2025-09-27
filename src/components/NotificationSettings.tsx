"use client";

// Notification settings component for DermAIr
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, AlertTriangle, Clock, CloudSun, Pill } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationPreferences } from "@/hooks/useNotifications";

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { 
    preferences, 
    permission, 
    savePreferences, 
    requestPermission, 
    loading 
  } = useNotifications();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const handleTestNotification = async () => {
    if (permission === 'granted') {
      const { notificationService } = await import('@/lib/notifications');
      await notificationService.notify({
        title: 'DermAIr Test Notification',
        body: 'Notifications are working correctly! 🎉',
        icon: '/favicon.ico'
      });
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      
      if (!granted) {
        if (permission === 'denied') {
          alert("Notifications were previously blocked. Please enable them manually in your browser settings:\n\n1. Click the lock icon in your address bar\n2. Change notifications to 'Allow'\n3. Refresh the page");
        } else {
          alert("Notifications were not granted. You can enable them later in your browser settings.");
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert("There was an error enabling notifications. Please try again or check your browser settings.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading notification settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage your alerts and reminders</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Permission Status */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {permission === 'granted' ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : permission === 'denied' ? (
                  <BellOff className="h-5 w-5 text-red-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {permission === 'granted' ? 'Notifications Enabled' : 
                     permission === 'denied' ? 'Notifications Blocked' :
                     'Notifications Disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {permission === 'granted' 
                      ? 'You can receive browser notifications' 
                      : permission === 'denied'
                      ? 'Notifications are blocked. Enable them in your browser settings.'
                      : 'Enable notifications to receive alerts and reminders'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {permission !== 'granted' && (
                  <Button 
                    onClick={handleEnableNotifications}
                    disabled={permission === 'denied'}
                    variant={permission === 'denied' ? 'outline' : 'default'}
                  >
                    {permission === 'denied' ? 'Blocked' : 'Enable'}
                  </Button>
                )}
                {permission === 'granted' && (
                  <Button onClick={handleTestNotification} variant="outline" size="sm">
                    Test Notification
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications-enabled" className="text-base font-medium">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Master switch for all DermAIr notifications
                </p>
              </div>
            </div>
            <Switch
              id="notifications-enabled"
              checked={preferences.enabled && permission === 'granted'}
              onCheckedChange={(checked) => handleToggle('enabled', checked)}
              disabled={permission !== 'granted'}
            />
          </div>

          {/* Individual Notification Types */}
          {preferences.enabled && permission === 'granted' && (
            <>
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Alert Types</h3>
                
                {/* Risk Alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <Label htmlFor="risk-alerts" className="text-base font-medium">
                        Risk Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when skin risk is elevated
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="risk-alerts"
                    checked={preferences.riskAlerts}
                    onCheckedChange={(checked) => handleToggle('riskAlerts', checked)}
                  />
                </div>

                {/* Risk Threshold */}
                {preferences.riskAlerts && (
                  <div className="ml-8 flex items-center gap-3">
                    <Label htmlFor="risk-threshold" className="text-sm">
                      Alert threshold:
                    </Label>
                    <Select
                      value={preferences.riskThreshold}
                      onValueChange={(value) => handleToggle('riskThreshold', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medium">Medium+</SelectItem>
                        <SelectItem value="high">High only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Daily Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="daily-reminders" className="text-base font-medium">
                        Daily Check-in Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Daily reminder to log your symptoms
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="daily-reminders"
                    checked={preferences.dailyReminders}
                    onCheckedChange={(checked) => handleToggle('dailyReminders', checked)}
                  />
                </div>

                {/* Reminder Time */}
                {preferences.dailyReminders && (
                  <div className="ml-8 flex items-center gap-3">
                    <Label htmlFor="reminder-time" className="text-sm">
                      Reminder time:
                    </Label>
                    <Select
                      value={preferences.reminderTime}
                      onValueChange={(value) => handleToggle('reminderTime', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Weather Briefings */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CloudSun className="h-5 w-5 text-yellow-500" />
                    <div>
                      <Label htmlFor="weather-briefings" className="text-base font-medium">
                        Morning Weather Briefings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Daily weather updates with skin risk info
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="weather-briefings"
                    checked={preferences.weatherBriefings}
                    onCheckedChange={(checked) => handleToggle('weatherBriefings', checked)}
                  />
                </div>

                {/* Medication Reminders */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-green-500" />
                    <div>
                      <Label htmlFor="medication-reminders" className="text-base font-medium">
                        Medication Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for skin treatments (coming soon)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="medication-reminders"
                    checked={preferences.medicationReminders}
                    onCheckedChange={(checked) => handleToggle('medicationReminders', checked)}
                    disabled={true} // Coming soon
                  />
                </div>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}