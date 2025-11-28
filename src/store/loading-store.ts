import { create } from 'zustand'

interface LoadingState {
    // Loading State
    isLoading: boolean
    message: string
    setLoading: (loading: boolean, message?: string) => void

    // Error State
    error: string | null
    setError: (error: string | null) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
    // Loading Defaults
    isLoading: false,
    message: 'Loading...',
    setLoading: (loading: boolean, message: string = 'Loading...') =>
        set({ isLoading: loading, message }),

    // Error Defaults
    error: null,
    setError: (error: string | null) => set({ error }),
}))
