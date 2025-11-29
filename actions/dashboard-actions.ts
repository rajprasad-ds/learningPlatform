'use server'

import { createClient } from '@/lib/supabase/server'

export async function getLastWatchedLesson() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // Get the most recently updated lesson progress
        const { data: progress, error } = await supabase
            .from('lesson_progress')
            .select(`
                lesson_id,
                progress,
                last_watched_at,
                lessons (
                    id,
                    title,
                    position,
                    module_id,
                    modules (
                        id,
                        title,
                        course_id,
                        courses (
                            id,
                            title,
                            thumbnail_url
                        )
                    )
                )
            `)
            .eq('user_id', user.id)
            .order('last_watched_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !progress) return null

        const lesson = Array.isArray(progress.lessons) ? progress.lessons[0] : progress.lessons
        if (!lesson) return null

        // @ts-ignore
        const module = Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules
        if (!module) return null

        // @ts-ignore
        const course = Array.isArray(module.courses) ? module.courses[0] : module.courses
        if (!course) return null

        return {
            courseId: course.id,
            courseTitle: course.title,
            courseThumbnail: course.thumbnail_url,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            progress: progress.progress,
            moduleId: module.id,
            moduleTitle: module.title
        }
    } catch (error) {
        console.error('Failed to get last watched lesson:', error)
        return null
    }
}

export async function getDashboardStats() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { coursesInProgress: 0, completedLessons: 0 }

        // Get enrolled courses count
        const { count: enrolledCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        // Get completed lessons count (proxy for hours learned for now)
        const { count: completedLessons } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true)

        return {
            coursesInProgress: enrolledCount || 0,
            completedLessons: completedLessons || 0
        }
    } catch (error) {
        console.error('Failed to get dashboard stats:', error)
        return { coursesInProgress: 0, completedLessons: 0 }
    }
}
