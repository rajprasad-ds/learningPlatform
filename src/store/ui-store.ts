import { create } from 'zustand'

interface UIState {
    sidebarOpen: boolean
    theme: 'light' | 'dark'

    // Actions
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    theme: 'dark',

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setTheme: (theme) => {
        set({ theme })
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    },

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        return { theme: newTheme }
    }),
}))
