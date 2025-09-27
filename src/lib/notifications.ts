"use client";

/**
 * Browser notification service for DermAIr
 * Handles permission requests, risk alerts, and reminder notifications
 */

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.permission = Notification.permission;
    }
  }
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return false;
    }
    
    if (this.permission === 'granted') {
      return true;
    }
    
    if (this.permission === 'denied') {
      console.warn('Notification permission was previously denied');
      return false;
    }
    
    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      this.permission = permission;
      
      // Also update the global Notification.permission reference
      if (typeof window !== 'undefined') {
        // Force a check of the actual permission state
        setTimeout(() => {
          this.permission = Notification.permission;
        }, 100);
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  /**
   * Check if notifications are supported and permitted
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      this.permission === 'granted'
    );
  }
  
  /**
   * Send a notification
   */
  async notify(config: NotificationConfig): Promise<Notification | null> {
    if (!this.isAvailable()) {
      console.warn('Notifications not available or not permitted');
      return null;
    }
    
    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon || '/favicon.ico',
        badge: config.badge || '/favicon.ico',
        tag: config.tag,
        data: config.data,
        requireInteraction: false,
        silent: false
      });
      
      // Auto-close after 8 seconds
      setTimeout(() => {
        notification.close();
      }, 8000);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
  
  /**
   * Send risk alert notification
   */
  async sendRiskAlert(riskLevel: 'medium' | 'high', riskScore: number, mainFactors: string[]): Promise<void> {
    const emoji = riskLevel === 'high' ? '🚨' : '⚠️';
    const urgency = riskLevel === 'high' ? 'High' : 'Moderate';
    
    await this.notify({
      title: `${emoji} ${urgency} Skin Risk Alert`,
      body: `Risk score: ${riskScore}%. Main factors: ${mainFactors.slice(0, 2).join(', ')}.`,
      tag: 'risk-alert',
      data: { type: 'risk-alert', riskLevel, riskScore }
    });
  }
  
  /**
   * Send daily reminder notification
   */
  async sendDailyReminder(): Promise<void> {
    await this.notify({
      title: '📱 DermAIr Daily Check-in',
      body: 'How is your skin feeling today? Take a moment to log your symptoms.',
      tag: 'daily-reminder',
      data: { type: 'daily-reminder' }
    });
  }
  
  /**
   * Send weather briefing notification
   */
  async sendWeatherBriefing(weather: { temperature: number; condition: string; riskLevel: string }): Promise<void> {
    const emoji = weather.riskLevel === 'high' ? '🌡️' : weather.riskLevel === 'medium' ? '☁️' : '☀️';
    
    await this.notify({
      title: `${emoji} Morning Weather Briefing`,
      body: `${Math.round(weather.temperature)}°C, ${weather.condition}. Skin risk: ${weather.riskLevel}`,
      tag: 'weather-briefing',
      data: { type: 'weather-briefing' }
    });
  }
  
  /**
   * Send medication reminder notification
   */
  async sendMedicationReminder(medicationName?: string): Promise<void> {
    await this.notify({
      title: '💊 Medication Reminder',
      body: medicationName ? `Time for your ${medicationName}` : 'Don\'t forget your skin medication',
      tag: 'medication-reminder',
      data: { type: 'medication-reminder' }
    });
  }
}

// Singleton instance
export const notificationService = NotificationService.getInstance();