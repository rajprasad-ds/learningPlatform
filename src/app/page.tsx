import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-blue-500/30">
      <Hero />
      <Features />

      {/* Footer Placeholder */}
      <footer className="py-12 border-t border-border/40 text-center text-muted-foreground">
        <p>© 2024 Lumina Academy. Built with Next.js & Supabase.</p>
      </footer>
    </main>
  )
}
