'use server'

import { createClient } from '@/lib/supabase/server'
import { generateSignedURL } from '@/lib/bunny-stream'

// Generate video access token
export async function generateVideoToken(lessonId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Unauthorized')
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*, modules!inner(course_id)')
        .eq('id', lessonId)
        .single()

    if (lessonError || !lesson) {
        throw new Error('Lesson not found')
    }

    if (!lesson.video_url) {
        throw new Error('Video content is not available for this lesson')
    }

    // Check if lesson is free
    if (lesson.is_free) {
        // Free lessons don't need enrollment check
        return generateToken(lesson.video_url, user.id, user.email!)
    }

    // Check enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', lesson.modules.course_id)
        .single()

    if (enrollmentError || !enrollment) {
        throw new Error('Not enrolled in this course')
    }

    // Check if enrollment is still active
    if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
        throw new Error('Course enrollment expired')
    }

    // Log video access
    await supabase.from('video_access_logs').insert({
        user_id: user.id,
        lesson_id: lessonId,
        ip_address: getClientIP(),
        user_agent: getUserAgent(),
    })

    // Generate token
    return generateToken(lesson.video_url, user.id, user.email!)
}

// Refresh video token
export async function refreshVideoToken(lessonId: string, oldToken: string) {
    // Same checks as generateVideoToken
    return generateVideoToken(lessonId)
}

// Mark lesson as complete
export async function markLessonComplete(lessonId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get lesson's course
    const { data: lesson } = await supabase
        .from('lessons')
        .select('*, modules!inner(course_id)')
        .eq('id', lessonId)
        .single()

    if (!lesson) throw new Error('Lesson not found')

    // Update or insert progress
    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: lesson.modules.course_id,
            progress: 100,
            completed: true,
            completed_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,lesson_id'
        })

    if (error) throw error

    return { success: true }
}

// Track video progress
export async function trackVideoProgress(lessonId: string, progress: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*, modules!inner(course_id)')
        .eq('id', lessonId)
        .single()

    if (!lesson) throw new Error('Lesson not found')

    await supabase
        .from('lesson_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            course_id: lesson.modules.course_id,
            progress: Math.round(progress),
            last_watched_at: new Date().toISOString(),
        })

    return { success: true }
}

// Get course lessons
export async function getCourseLessons(courseId: string) {
    const supabase = await createClient()

    const { data: modules, error } = await supabase
        .from('modules')
        .select(`
      *,
      lessons (
        id,
        title,
        type,
        is_free,
        position,
        created_at
      )
    `)
        .eq('course_id', courseId)
        .order('position')

    if (error) throw error

    return modules
}

// Get lesson by ID
export async function getLessonById(lessonId: string) {
    const supabase = await createClient()

    const { data: lesson, error } = await supabase
        .from('lessons')
        .select(`
      *,
      modules!inner(
        id,
        title,
        course_id,
        courses!inner(
          id,
          title,
          teacher_id
        )
      )
    `)
        .eq('id', lessonId)
        .single()

    if (error) throw error

    return lesson
}

// Helper functions
function generateToken(videoUrl: string, userId: string, userEmail: string) {
    if (!videoUrl) {
        throw new Error('Video URL not found for this lesson')
    }

    // Extract video ID from URL (assuming format: bunny://video-id or just video-id)
    const videoId = videoUrl.replace('bunny://', '')

    const sessionId = Math.random().toString(36).substring(7).toUpperCase()
    const ipAddress = getClientIP()

    // Generate signed URL with Bunny.net
    const signedUrl = generateSignedURL({
        videoId,
        expiresIn: 3600, // 1 hour
        ipAddress,
    })

    return {
        token: sessionId,
        videoUrl: signedUrl,
        expiresIn: 3600,
        watermark: {
            userEmail,
            userId,
            sessionId,
            ipAddress,
        }
    }
}

function getClientIP(): string {
    // TODO: Get actual client IP from headers
    return '192.168.1.1'
}

function getUserAgent(): string {
    // TODO: Get actual user agent from headers
    return 'Mozilla/5.0'
}

// Get all modules and lessons for a course (for playlist)
export async function getCourseModules(courseId: string) {
    const supabase = await createClient()

    const { data: modules, error } = await supabase
        .from('modules')
        .select(`
            id,
            title,
            position,
            lessons(
                id,
                title,
                position,
                is_free,
                type,
                module_id
            )
        `)
        .eq('course_id', courseId)
        .order('position')

    if (error) {
        console.error('Error fetching modules:', error)
        return []
    }

    // Sort lessons within each module
    return modules?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a: any, b: any) => a.position - b.position) || []
    })) || []
}

// FIX: Populate missing video URLs for testing
export async function fixLessonVideoUrls() {
    const supabase = await createClient()

    // Update all lessons that don't have a video_url
    const { error } = await supabase
        .from('lessons')
        .update({
            video_url: 'bunny://782751f8-6b03-4221-a6aa-9dae6acc900f',
            video_provider: 'bunny',
            video_id: '782751f8-6b03-4221-a6aa-9dae6acc900f'
        })
        .is('video_url', null)

    if (error) throw error
    return { success: true }
}
