import { create } from 'zustand'

interface LoadingState {
    isLoading: boolean
    message: string
    setLoading: (loading: boolean, message?: string) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    message: 'Loading...',
    setLoading: (loading: boolean, message: string = 'Loading...') =>
        set({ isLoading: loading, message }),
}))
