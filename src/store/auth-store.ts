import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    loading: boolean
    initialized: boolean

    // Actions
    setUser: (user: User | null) => void
    initialize: () => Promise<void>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user, loading: false }),

    initialize: async () => {
        if (get().initialized) return

        const supabase = createClient()

        // Get initial session
        const { data: { user } } = await supabase.auth.getUser()
        set({ user, loading: false, initialized: true })

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, loading: false })
        })
    },

    refreshUser: async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        set({ user, loading: false })
    },

    signOut: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, loading: false })
    },
}))
