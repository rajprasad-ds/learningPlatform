'use client'

import { usePathname } from 'next/navigation'
import { PageTransition } from '@/components/layout/page-transition'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Skip transitions for auth pages and dashboard (dashboard has its own transitions)
    const skipTransition =
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/dashboard')

    if (skipTransition) {
        return <>{children}</>
    }

    return <PageTransition>{children}</PageTransition>
}
