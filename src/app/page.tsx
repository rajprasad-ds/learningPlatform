'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { createClient } from '@/lib/supabase/client'
import { Loader } from 'lucide-react'

// ...

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role || 'student'

        if (role === 'teacher' || role === 'admin') {
          router.push('/teacher')
        } else {
          router.push('/dashboard')
        }
      } else {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background selection:bg-blue-500/30">
      <Hero />
      <Features />

      {/* Footer Placeholder */}
      <footer className="py-12 border-t border-border/40 text-center text-muted-foreground">
        <p>© 2024 Invincible Mechanics. Built with Next.js & Supabase.</p>
      </footer>
    </main>
  )
}
