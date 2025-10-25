import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-2' | 'palm'

export interface AIModelConfig {
  name: string
  maxTokens: number
  costPer1kTokens: number
  supportsStreaming: boolean
}

export const AI_MODEL_CONFIGS: Record<AIModel, AIModelConfig> = {
  'gpt-4': {
    name: 'GPT-4',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    supportsStreaming: true
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    maxTokens: 4096,
    costPer1kTokens: 0.002,
    supportsStreaming: true
  },
  'claude-2': {
    name: 'Claude 2',
    maxTokens: 100000,
    costPer1kTokens: 0.01,
    supportsStreaming: true
  },
  'palm': {
    name: 'PaLM',
    maxTokens: 8192,
    costPer1kTokens: 0.001,
    supportsStreaming: false
  }
}

interface AISettings {
  // Authentication
  apiKey: string
  provider: 'openai' | 'anthropic' | 'google'
  model: AIModel
  
  // Feature flags
  isEnabled: boolean
  useStreaming: boolean
  shouldCache: boolean
  
  // Analysis settings
  analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  updateFrequency: 'realtime' | 'hourly' | 'daily'
  confidenceThreshold: number
  
  // Usage tracking
  totalTokensUsed: number
  lastUsed: string | null
  
  // Actions
  setAPIKey: (key: string) => void
  setProvider: (provider: 'openai' | 'anthropic' | 'google') => void
  setModel: (model: AIModel) => void
  toggleAI: () => void
  setAnalysisDepth: (depth: 'basic' | 'detailed' | 'comprehensive') => void
  setUpdateFrequency: (freq: 'realtime' | 'hourly' | 'daily') => void
  setConfidenceThreshold: (threshold: number) => void
  addTokensUsed: (tokens: number) => void
  resetUsage: () => void
  clearSettings: () => void
}

const initialState = {
  apiKey: '',
  provider: 'openai' as const,
  model: 'gpt-4' as AIModel,
  isEnabled: false,
  useStreaming: true,
  shouldCache: true,
  analysisDepth: 'detailed' as const,
  updateFrequency: 'hourly' as const,
  confidenceThreshold: 0.85,
  totalTokensUsed: 0,
  lastUsed: null
}

export const useAISettings = create<AISettings>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAPIKey: (key) => set({ apiKey: key }),
      
      setProvider: (provider) => set({ provider }),
      
      setModel: (model) => set({ 
        model,
        useStreaming: AI_MODEL_CONFIGS[model].supportsStreaming && get().useStreaming
      }),
      
      toggleAI: () => set((state) => ({ 
        isEnabled: !state.isEnabled,
        lastUsed: !state.isEnabled ? new Date().toISOString() : state.lastUsed
      })),
      
      setAnalysisDepth: (depth) => set({ analysisDepth: depth }),
      
      setUpdateFrequency: (freq) => set({ updateFrequency: freq }),
      
      setConfidenceThreshold: (threshold) => set({ 
        confidenceThreshold: Math.max(0, Math.min(1, threshold)) 
      }),
      
      addTokensUsed: (tokens) => set((state) => ({
        totalTokensUsed: state.totalTokensUsed + tokens,
        lastUsed: new Date().toISOString()
      })),
      
      resetUsage: () => set({ 
        totalTokensUsed: 0,
        lastUsed: null
      }),
      
      clearSettings: () => set(initialState)
    }),
    {
      name: 'ai-settings',
      version: 1,
      partialize: (state) => ({
        // Only persist these fields
        apiKey: state.apiKey,
        provider: state.provider,
        model: state.model,
        isEnabled: state.isEnabled,
        analysisDepth: state.analysisDepth,
        updateFrequency: state.updateFrequency,
        confidenceThreshold: state.confidenceThreshold,
        totalTokensUsed: state.totalTokensUsed,
        lastUsed: state.lastUsed
      })
    }
  )
)