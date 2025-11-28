'use client'

import { Navbar } from './navbar'
import { usePathname } from 'next/navigation'

export function ConditionalNavbar() {
    const pathname = usePathname()

    // Hide navbar on lesson player pages and teacher studio
    // Pattern: /courses/[id]/lessons/[lessonId] or /teacher/*
    const isLessonPage = pathname?.includes('/lessons/')
    const isTeacherPage = pathname?.startsWith('/teacher')

    if (isLessonPage || isTeacherPage) {
        return null
    }

    return <Navbar />
}
