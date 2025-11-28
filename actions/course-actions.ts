'use server'

import { createClient } from '@/lib/supabase/server'

// Get all enrolled courses for the current user with progress
export async function getEnrolledCourses() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            console.error('Auth error:', userError)
            return []
        }

        // Get enrollments with course details - using only columns that definitely exist
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('enrollments')
            .select(`
        id,
        created_at,
        course_id,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (enrollmentError) {
            console.error('Enrollment error:', enrollmentError)
            return []
        }

        if (!enrollments || enrollments.length === 0) {
            return []
        }

        // For each course, calculate progress
        const coursesWithProgress = await Promise.all(
            enrollments.map(async (enrollment: any) => {
                const courseId = enrollment.course_id

                // Get all modules for this course
                const { data: modules } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('course_id', courseId)

                const moduleIds = modules?.map(m => m.id) || []

                // Get all lessons for this course (through modules)
                let totalLessons = 0
                let lessonIds: string[] = []

                if (moduleIds.length > 0) {
                    const { data: lessons } = await supabase
                        .from('lessons')
                        .select('id')
                        .in('module_id', moduleIds)

                    lessonIds = lessons?.map(l => l.id) || []
                    totalLessons = lessonIds.length
                }

                // Get completed lessons for this course
                let completedLessons = 0
                if (lessonIds.length > 0) {
                    const { count } = await supabase
                        .from('lesson_progress')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .in('lesson_id', lessonIds)
                        .eq('completed', true)

                    completedLessons = count || 0
                }

                // Calculate progress percentage
                const progress = totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0

                return {
                    id: enrollment.courses.id,
                    title: enrollment.courses.title,
                    description: enrollment.courses.description,
                    thumbnail_url: enrollment.courses.thumbnail_url,
                    enrollmentId: enrollment.id,
                    enrolledAt: enrollment.created_at,
                    progress,
                    totalLessons,
                    completedLessons,
                }
            })
        )

        return coursesWithProgress
    } catch (error) {
        console.error('Fatal error in getEnrolledCourses:', error)
        return []
    }
}

// Get course progress details
export async function getCourseProgress(courseId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get all lessons in course with progress
    const { data: modules } = await supabase
        .from('modules')
        .select(`
      id,
      title,
      position,
      lessons (
        id,
        title,
        type,
        position
      )
    `)
        .eq('course_id', courseId)
        .order('position')

    if (!modules) return null

    // Get user's progress for all lessons
    const lessonIds = modules.flatMap(m => m.lessons.map((l: any) => l.id))

    const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, progress, completed, last_watched_at')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)

    // Map progress to lessons
    const progressMap = new Map(
        progressData?.map(p => [p.lesson_id, p]) || []
    )

    const modulesWithProgress = modules.map(module => ({
        ...module,
        lessons: module.lessons.map((lesson: any) => ({
            ...lesson,
            progress: progressMap.get(lesson.id)?.progress || 0,
            completed: progressMap.get(lesson.id)?.completed || false,
            lastWatchedAt: progressMap.get(lesson.id)?.last_watched_at,
        }))
    }))

    return modulesWithProgress
}
