import { getLessonById, generateVideoToken, getCourseModules, getLessonProgress } from '@/actions/video-actions'
import { getLessonComments } from '@/actions/comment-actions'
import { LessonContent } from './lesson-content'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VideoErrorDisplay } from '@/components/video/video-error-display'

interface LessonViewerProps {
    params: Promise<{ id: string; lessonId: string }>
}

export default async function LessonViewer({ params }: LessonViewerProps) {
    const { id, lessonId } = await params
    const supabase = await createClient()

    try {
        // Fetch all required data in parallel
        const [lesson, videoToken, modules, comments, userProgress] = await Promise.all([
            getLessonById(lessonId),
            generateVideoToken(lessonId),
            getCourseModules(id),
            getLessonComments(lessonId),
            getLessonProgress(lessonId)
        ])

        // Check enrollment status
        const { data: { user } } = await supabase.auth.getUser()
        let isEnrolled = false
        if (user) {
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', id)
                .single()
            isEnrolled = !!enrollment
        }

        // Flatten lessons for playlist count
        const allLessons = modules.flatMap((m: any) => m.lessons)

        return (
            <LessonContent
                lesson={lesson}
                videoToken={videoToken}
                modules={modules}
                allLessons={allLessons}
                initialCompleted={userProgress?.completed || false}
                courseId={id}
                lessonId={lessonId}
                isEnrolled={isEnrolled}
                initialComments={comments}
                currentUser={user}
                userProgress={userProgress}
            />
        )
    } catch (error: any) {
        return <VideoErrorDisplay message={error.message || 'Failed to load lesson'} courseId={id} />
    }
}
