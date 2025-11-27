'use client'
'use client'

import { usePathname } from 'next/navigation'
import { PageTransition } from '@/components/layout/page-transition'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Skip transitions only for login and signup
    const skipTransition = pathname.startsWith('/login') || pathname.startsWith('/signup')

    if (skipTransition) {
        return <>{children}</>
    }

    return <PageTransition>{children}</PageTransition>
}
