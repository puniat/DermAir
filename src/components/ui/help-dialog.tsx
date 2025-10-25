'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Button } from './button'
import { HelpCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { useAISettings, type AIModel } from '@/lib/stores/ai-settings'
import { useState } from 'react'

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Help & Documentation</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="calculations">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculations">Risk Calculations</TabsTrigger>
            <TabsTrigger value="ai-mode">AI Mode</TabsTrigger>
            <TabsTrigger value="settings">API Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculations">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Calculations</CardTitle>
                <CardDescription>
                  Understanding how risk levels are calculated in standard mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Base Risk Formula</h4>
                  <p className="mb-3">The risk assessment uses the following factors to calculate risk:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>UV Index</strong> (Weight: 40%)</li>
                    <li><strong>Temperature</strong> (Weight: 25%)</li>
                    <li><strong>Humidity</strong> (Weight: 20%)</li>
                    <li><strong>User Sensitivity Level</strong> (Weight: 15%)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Calculation Method</h4>
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <code className="text-sm font-mono">
                      Risk Score = (UVIndex × 0.4) + (TempFactor × 0.25) + 
                      <br />
                      (HumidityFactor × 0.2) + (SensitivityFactor × 0.15)
                    </code>
                  </div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>UV Index:</strong> Direct value from weather API (0-12 scale)</li>
                    <li><strong>Temperature Factor:</strong> Normalized value between 0-1 based on comfort range</li>
                    <li><strong>Humidity Factor:</strong> Normalized value between 0-1 (higher humidity = higher risk)</li>
                    <li><strong>Sensitivity:</strong> User-defined value (1-5 scale, normalized to 0-1)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-mode">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Analytics</CardTitle>
                <CardDescription>
                  Enhanced risk assessment and personalized recommendations using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Enhanced Features</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Pattern Recognition:</strong> Analyzes historical data to identify personal triggers</li>
                    <li><strong>Contextual Analysis:</strong> Considers multiple environmental factors simultaneously</li>
                    <li><strong>Personalized Feedback:</strong> Provides specific recommendations based on your history</li>
                    <li><strong>Predictive Alerts:</strong> Anticipates high-risk conditions before they occur</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">AI Processing</h4>
                  <p className="mb-3">When AI mode is enabled, the system:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Processes historical check-in data to identify patterns</li>
                    <li>Analyzes environmental data correlations</li>
                    <li>Uses LLM to generate personalized recommendations</li>
                    <li>Continuously learns from your feedback and responses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Configure your AI provider settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label htmlFor="api-key" className="text-sm font-semibold">API Key</label>
                    <input
                      id="api-key"
                      type="password"
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={useAISettings((state) => state.apiKey)}
                      onChange={(e) => useAISettings.getState().setAPIKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="provider" className="text-sm font-semibold">AI Provider</label>
                    <select
                      id="provider"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={useAISettings((state) => state.provider)}
                      onChange={(e) => useAISettings.getState().setProvider(e.target.value as 'openai' | 'anthropic' | 'google')}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google AI</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="model" className="text-sm font-semibold">AI Model</label>
                    <select
                      id="model"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={useAISettings((state) => state.model)}
                      onChange={(e) => useAISettings.getState().setModel(e.target.value as AIModel)}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-2">Claude 2</option>
                      <option value="palm">PaLM</option>
                    </select>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Privacy Notice:</strong> Your API key is securely stored in your browser and is never sent to our servers.
                      The key is only used for direct communication with your chosen AI provider.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}