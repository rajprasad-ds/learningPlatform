import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'student' | 'teacher' | 'admin'
}

interface AuthState {
    user: User | null
    profile: Profile | null
    loading: boolean
    initialized: boolean

    // Actions
    setUser: (user: User | null) => void
    setProfile: (profile: Profile | null) => void
    initialize: () => Promise<void>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),

    initialize: async () => {
        if (get().initialized) return

        const supabase = createClient()

        // Get initial session
        const { data: { user } } = await supabase.auth.getUser()

        let profile: Profile | null = null
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            profile = data
        }

        set({ user, profile, loading: false, initialized: true })

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user ?? null
            let profile: Profile | null = null

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                profile = data
            }

            set({ user, profile, loading: false })
        })
    },

    refreshUser: async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let profile: Profile | null = null
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            profile = data
        }

        set({ user, profile, loading: false })
    },

    signOut: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, profile: null, loading: false })
    },
}))
