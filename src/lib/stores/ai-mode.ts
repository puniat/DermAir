import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AIModeStore {
  isAIModeEnabled: boolean
  toggleAIMode: () => void
  enableAIMode: () => void
  disableAIMode: () => void
}

export const useAIModeStore = create<AIModeStore>()(
  persist(
    (set) => ({
      isAIModeEnabled: false,
      toggleAIMode: () => set((state) => ({ isAIModeEnabled: !state.isAIModeEnabled })),
      enableAIMode: () => set({ isAIModeEnabled: true }),
      disableAIMode: () => set({ isAIModeEnabled: false }),
    }),
    {
      name: 'ai-mode-storage',
    }
  )
)