'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { getCurrentUser } from '../../actions/auth-actions'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
