"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
// import { googleAuth } from '@/lib/services/google-auth';
// import { googleSheets } from '@/lib/services/google-sheets';
import {
  Cloud,
  CloudOff,
  Download,
  ExternalLink,
  LogOut,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react';

interface AccountSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettings({ open, onOpenChange }: AccountSettingsProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      checkConnection();
    }
  }, [open]);

  const checkConnection = () => {
    // const isAuth = googleAuth.isAuthenticated();
    const isAuth = false; // Google Auth disabled
    setIsConnected(isAuth);
    if (isAuth) {
      // setUser(googleAuth.getCurrentUser());
      setUser(null); // Google Auth disabled
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setIsSyncing(true);
      // const user = await googleAuth.signIn();
      const user = null; // Google Auth disabled
      setUser(user);
      setIsConnected(true);

      // Sync current profile to Google
      const localProfile = localStorage.getItem('dermair-profile');
      if (localProfile) {
        const profile = JSON.parse(localProfile);
        // await googleSheets.initializeSpreadsheet();
        // await googleSheets.saveProfile(profile);
        setLastSync(new Date());
      }
    } catch (error: any) {
      console.error('Failed to connect Google:', error);
      alert('Failed to connect Google account. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Google? Your local data will remain, but cloud sync will stop.')) {
      // googleAuth.signOut();
      // googleSheets.clearSpreadsheet();
      setUser(null);
      setIsConnected(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      const localProfile = localStorage.getItem('dermair-profile');
      if (localProfile) {
        const profile = JSON.parse(localProfile);
        // await googleSheets.saveProfile(profile);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync. Please check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewSpreadsheet = () => {
    // const url = googleSheets.getSpreadsheetUrl();
    const url = '';
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleExportData = () => {
    const profile = localStorage.getItem('dermair-profile');
    if (profile) {
      const blob = new Blob([profile], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dermair-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSwitchAccount = async () => {
    if (confirm('Switch to a different Google account? You\'ll need to sign in again.')) {
      // googleAuth.signOut();
      // googleSheets.clearSpreadsheet();
      localStorage.removeItem('dermair-profile');
      router.push('/landing');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account & Sync Settings</DialogTitle>
          <DialogDescription>
            Manage your Google account connection and data synchronization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Google Account Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Google Account
            </h3>

            {isConnected && user ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <Cloud className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Button
                      onClick={handleDisconnect}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last synced:</span>
                      <span className="font-medium">
                        {lastSync ? lastSync.toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSyncNow}
                        disabled={isSyncing}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                      <Button
                        onClick={handleViewSpreadsheet}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in Drive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <CloudOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Not connected to Google Drive
                    </p>
                    <Button
                      onClick={handleConnectGoogle}
                      disabled={isSyncing}
                      className="w-full"
                    >
                      <Cloud className="h-4 w-4 mr-2" />
                      Connect Google Account
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      Backup your data and sync across devices
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Management
            </h3>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-gray-600">Download a backup of your profile</p>
                  </div>
                  <Button onClick={handleExportData} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-sm font-medium">Switch Account</p>
                    <p className="text-xs text-gray-600">Use a different Google account</p>
                  </div>
                  <Button onClick={handleSwitchAccount} variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Switch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </h3>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm">
              <ul className="space-y-2 text-blue-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Your data is stored in <strong>your own</strong> Google Drive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>DermAir cannot access your other Google Drive files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You can revoke access anytime from Google Account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>All data transmission is encrypted via HTTPS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
