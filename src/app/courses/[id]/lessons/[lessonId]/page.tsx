import { getLessonById, generateVideoToken, getCourseModules } from '@/actions/video-actions'
import { LessonContent } from './lesson-content'
import Link from 'next/link'

interface LessonViewerProps {
    params: Promise<{ id: string; lessonId: string }>
}

export default async function LessonViewer({ params }: LessonViewerProps) {
    const { id, lessonId } = await params

    try {
        // Fetch all required data in parallel
        const [lesson, videoToken, modules] = await Promise.all([
            getLessonById(lessonId),
            generateVideoToken(lessonId),
            getCourseModules(id)
        ])

        // Flatten lessons for playlist count
        const allLessons = modules.flatMap((m: any) => m.lessons)

        return (
            <LessonContent
                lesson={lesson}
                videoToken={videoToken}
                modules={modules}
                allLessons={allLessons}
                initialCompleted={false} // TODO: Fetch actual completion status
                courseId={id}
                lessonId={lessonId}
            />
        )
    } catch (error: any) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
                <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-zinc-800 max-w-md text-center">
                    <div className="text-red-500 mb-4 text-lg font-semibold">Error</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error.message || 'Failed to load lesson'}</p>
                    <Link href={`/courses/${id}`}>
                        <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50 active:scale-95">
                            Back to Course
                        </button>
                    </Link>
                </div>
            </div>
        )
    }
}
