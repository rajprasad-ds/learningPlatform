'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedVideoPlayer } from '@/components/video/protected-video-player'
import { markLessonComplete, trackVideoProgress } from '@/actions/video-actions'
import { ChevronLeft, CheckCircle, Lock, PlayCircle } from 'lucide-react'
import Link from 'next/link'

interface Lesson {
    id: string
    title: string
    description?: string
    module_id: string
    position: number
    is_free: boolean
    type: string
}

interface Module {
    id: string
    title: string
    position: number
    lessons: Lesson[]
}

interface VideoToken {
    videoUrl: string
    watermark: {
        userEmail: string
        userId: string
        sessionId: string
        ipAddress: string
    }
}

interface LessonContentProps {
    lesson: Lesson
    videoToken: VideoToken
    modules: Module[]
    allLessons: Lesson[]
    initialCompleted: boolean
    courseId: string
    lessonId: string
}

export function LessonContent({
    lesson,
    videoToken,
    modules,
    allLessons,
    initialCompleted,
    courseId,
    lessonId
}: LessonContentProps) {
    const router = useRouter()
    const [completed, setCompleted] = useState(initialCompleted)

    const handleProgress = async (progress: number) => {
        try {
            await trackVideoProgress(lessonId, progress)
        } catch (err) {
            console.error('Failed to track progress:', err)
        }
    }

    const handleComplete = async () => {
        try {
            await markLessonComplete(lessonId)
            setCompleted(true)
        } catch (err) {
            console.error('Failed to mark complete:', err)
        }
    }

    const handleLessonClick = (targetLesson: Lesson) => {
        router.push(`/courses/${courseId}/lessons/${targetLesson.id}`)
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-background p-4 lg:p-6 flex flex-col">
            {/* Floating Container - Matching Dashboard Style */}
            <div className="flex-1 bg-white dark:bg-black rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col relative">

                {/* Header with Back Button */}
                <div className="px-4 lg:px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-black flex-shrink-0">
                    <Link href={`/courses/${courseId}`}>
                        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Course</span>
                        </button>
                    </Link>
                </div>

                {/* Main Content: Responsive Split */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

                    {/* Left Column (Video & Info) */}
                    <div className="w-full lg:flex-[7] lg:overflow-y-auto bg-white dark:bg-black order-1">
                        <div className="p-4 lg:p-6 space-y-6">

                            {/* Video Player */}
                            <div className="bg-gray-900 dark:bg-zinc-900 rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 aspect-video">
                                <ProtectedVideoPlayer
                                    videoUrl={videoToken.videoUrl}
                                    userEmail={videoToken.watermark.userEmail}
                                    userId={videoToken.watermark.userId}
                                    sessionId={videoToken.watermark.sessionId}
                                    ipAddress={videoToken.watermark.ipAddress}
                                    onProgress={handleProgress}
                                    onComplete={handleComplete}
                                />
                            </div>

                            {/* Lesson Info */}
                            <div>
                                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between mb-4">
                                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">{lesson.title}</h1>
                                    {completed && (
                                        <span className="self-start flex items-center gap-2 text-green-600 dark:text-green-400 text-xs lg:text-sm font-medium px-3 py-1.5 bg-green-100 dark:bg-green-500/10 rounded-full flex-shrink-0">
                                            <CheckCircle className="w-4 h-4" />
                                            Completed
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                                    {lesson.description || 'Watch this lesson to continue your learning journey.'}
                                </p>
                            </div>

                            {/* Resources Section */}
                            <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl lg:rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Lesson Resources</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No resources available for this lesson.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Playlist Sidebar) */}
                    <div className="w-full lg:flex-[3] border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-gray-700/50 lg:overflow-y-auto bg-gray-50 dark:bg-zinc-950 order-2">
                        <div className="p-4">

                            {/* Playlist Header */}
                            <div className="mb-4">
                                <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Course Playlist</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {allLessons.length} lessons
                                </p>
                            </div>

                            {/* Lessons List */}
                            <div className="space-y-2">
                                {modules.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        Loading playlist...
                                    </div>
                                ) : (
                                    modules.map((module) => (
                                        <div key={module.id} className="mb-4">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                                                {module.title}
                                            </div>

                                            <div className="space-y-1">
                                                {module.lessons.map((moduleLesson, index) => {
                                                    const isCurrentLesson = moduleLesson.id === lessonId
                                                    // TODO: Pass actual completion status from server
                                                    const isCompleted = false
                                                    const isLocked = !moduleLesson.is_free

                                                    return (
                                                        <button
                                                            key={moduleLesson.id}
                                                            onClick={() => !isLocked && handleLessonClick(moduleLesson)}
                                                            disabled={isLocked}
                                                            className={`
                                                                w-full text-left p-3 rounded-xl transition-all
                                                                ${isCurrentLesson
                                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                                    : isLocked
                                                                        ? 'bg-gray-100 dark:bg-zinc-900/50 opacity-60 cursor-not-allowed'
                                                                        : 'bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`
                                                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
                                                                    ${isCurrentLesson
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                                                                    }
                                                                `}>
                                                                    {isCompleted ? (
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    ) : isLocked ? (
                                                                        <Lock className="w-3 h-3" />
                                                                    ) : (
                                                                        index + 1
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`
                                                                        font-medium text-sm line-clamp-2
                                                                        ${isCurrentLesson ? 'text-white' : 'text-gray-700 dark:text-gray-200'}
                                                                    `}>
                                                                        {moduleLesson.title}
                                                                    </div>
                                                                    <div className={`
                                                                        text-xs mt-1 flex items-center gap-2
                                                                        ${isCurrentLesson ? 'text-white/80' : 'text-gray-500'}
                                                                    `}>
                                                                        {isCurrentLesson && (
                                                                            <span className="flex items-center gap-1">
                                                                                <PlayCircle className="w-3 h-3" />
                                                                                Now playing
                                                                            </span>
                                                                        )}
                                                                        {moduleLesson.is_free && !isCurrentLesson && (
                                                                            <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs">
                                                                                FREE
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
