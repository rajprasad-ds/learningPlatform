'use client'

import { Navbar } from './navbar'
import { usePathname } from 'next/navigation'

export function ConditionalNavbar() {
    const pathname = usePathname()

    // Hide navbar on lesson player pages
    // Pattern: /courses/[id]/lessons/[lessonId]
    const isLessonPage = pathname?.includes('/lessons/')

    if (isLessonPage) {
        return null
    }

    return <Navbar />
}
