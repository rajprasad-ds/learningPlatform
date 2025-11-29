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
                completed,
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

        // If lesson is NOT completed, return it as the one to resume
        // We consider it "completed" if progress is 100 or completed flag is true
        const isCompleted = progress.completed || progress.progress >= 100

        if (!isCompleted) {
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
        }

        // If completed, find the NEXT lesson in the course
        // 1. Get all modules for the course
        const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id)
            .order('position', { ascending: true })

        if (!modules) return null // Should not happen

        const moduleIds = modules.map(m => m.id)

        // 2. Get all lessons for the course
        const { data: allLessons } = await supabase
            .from('lessons')
            .select('id, title, position, module_id, modules(title)')
            .in('module_id', moduleIds)
            .order('position', { ascending: true }) // This sorts by lesson position, but we need module order too

        if (!allLessons) return null

        // Sort lessons by module position then lesson position
        // We can do this by mapping module order
        const moduleOrder = new Map(moduleIds.map((id, index) => [id, index]))
        const sortedLessons = allLessons.sort((a, b) => {
            const modA = moduleOrder.get(a.module_id) || 0
            const modB = moduleOrder.get(b.module_id) || 0
            if (modA !== modB) return modA - modB
            return a.position - b.position
        })

        // 3. Get completed lessons for this user in this course
        const { data: completedData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .in('lesson_id', sortedLessons.map(l => l.id))
            .eq('completed', true)

        const completedSet = new Set(completedData?.map(p => p.lesson_id) || [])

        // 4. Find the first lesson that is NOT in the completed set
        const nextLesson = sortedLessons.find(l => !completedSet.has(l.id))

        if (nextLesson) {
            // @ts-ignore
            const nextModuleTitle = Array.isArray(nextLesson.modules) ? nextLesson.modules[0]?.title : nextLesson.modules?.title

            return {
                courseId: course.id,
                courseTitle: course.title,
                courseThumbnail: course.thumbnail_url,
                lessonId: nextLesson.id,
                lessonTitle: nextLesson.title,
                progress: 0, // It's a new lesson
                moduleId: nextLesson.module_id,
                moduleTitle: nextModuleTitle || 'Module'
            }
        }

        // If no next lesson found (course completed), return the last watched one (which is completed)
        return {
            courseId: course.id,
            courseTitle: course.title,
            courseThumbnail: course.thumbnail_url,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            progress: 100,
            moduleId: module.id,
            moduleTitle: module.title,
            isCourseCompleted: true
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
