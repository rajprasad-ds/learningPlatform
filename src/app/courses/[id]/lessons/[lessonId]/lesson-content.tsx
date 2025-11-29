'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedVideoPlayer, ProtectedVideoPlayerRef } from '@/components/video/protected-video-player'
import { markLessonComplete, trackVideoProgress } from '@/actions/video-actions'
import {
    ChevronLeft, CheckCircle, Lock, PlayCircle, ChevronDown, ChevronRight,
    FileText, MessageCircle, BookOpen, Download, AlertCircle, ListVideo
} from 'lucide-react'
import Link from 'next/link'
import { CommentSection } from '@/components/courses/comment-section'

interface Lesson {
    id: string
    title: string
    description?: string
    module_id: string
    position: number
    is_free: boolean
    type: string
    video_id?: string
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
    isEnrolled: boolean
    initialComments: any[]
    currentUser: any
    userProgress?: any
}

type Tab = 'playlist' | 'resources' | 'qa' | 'notes'

export function LessonContent({
    lesson,
    videoToken,
    modules,
    allLessons,
    initialCompleted,
    courseId,
    lessonId,
    isEnrolled,
    initialComments,
    currentUser,
    userProgress
}: LessonContentProps) {
    const router = useRouter()
    // Initialize progress from props, default to 0
    const [currentProgress, setCurrentProgress] = useState(userProgress?.progress || 0)
    const [expandedModules, setExpandedModules] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<Tab>('playlist')
    const [currentTime, setCurrentTime] = useState(0)
    const activeLessonRef = useRef<HTMLButtonElement>(null)
    const playerRef = useRef<ProtectedVideoPlayerRef>(null)

    const handleTimestampClick = (time: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(time, true)
        }
    }

    // Google-style Hover Scroll Logic
    useEffect(() => {
        const rail = document.getElementById('tab-rail')
        if (!rail) return

        let scrollInterval: any = null

        const startScroll = (direction: 'left' | 'right') => {
            stopScroll()
            scrollInterval = setInterval(() => {
                rail.scrollLeft += direction === 'left' ? -5 : 5
            }, 10)
        }

        const stopScroll = () => {
            if (scrollInterval) clearInterval(scrollInterval)
            scrollInterval = null
        }

        const handleMouseMove = (e: MouseEvent) => {
            const { left, width } = rail.getBoundingClientRect()
            const x = e.clientX - left
            const edgeSize = 50 // px near edges where auto-scroll triggers

            if (x < edgeSize) startScroll('left')
            else if (x > width - edgeSize) startScroll('right')
            else stopScroll()
        }

        rail.addEventListener('mousemove', handleMouseMove)
        rail.addEventListener('mouseleave', stopScroll)

        return () => {
            stopScroll()
            rail.removeEventListener('mousemove', handleMouseMove)
            rail.removeEventListener('mouseleave', stopScroll)
        }
    }, [])

    useEffect(() => {
        // Find module containing current lesson
        const currentModule = modules.find(m => m.lessons.some(l => l.id === lessonId))
        if (currentModule) {
            setExpandedModules(prev => [...new Set([...prev, currentModule.id])])
        }

        // Scroll to active lesson
        if (activeLessonRef.current) {
            activeLessonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [lessonId, modules])

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time)
    }

    const handleProgress = async (progress: number, time: number) => {
        try {
            setCurrentProgress(progress) // Update local state immediately
            await trackVideoProgress(lessonId, progress, time)
        } catch (err) {
            console.error('Failed to track progress:', err)
        }
    }

    const handleComplete = async () => {
        try {
            await markLessonComplete(lessonId)
            setCurrentProgress(100) // Force 100% on complete

            // Auto-play next lesson
            const currentIndex = allLessons.findIndex(l => l.id === lessonId)
            if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
                const nextLesson = allLessons[currentIndex + 1]

                // Only auto-play if user has access
                if (isEnrolled || nextLesson.is_free) {
                    // Small delay for UX
                    setTimeout(() => {
                        router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)
                    }, 1500)
                }
            }
        } catch (err) {
            console.error('Failed to mark complete:', err)
        }
    }

    const handleLessonClick = (targetLesson: Lesson) => {
        router.push(`/courses/${courseId}/lessons/${targetLesson.id}`)
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-background p-4 lg:p-6 flex flex-col page-enter">
            {/* Floating Container */}
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
                <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">

                    {/* Left Column (Video & Info) */}
                    <div className="w-full lg:flex-[7] lg:overflow-y-auto bg-white dark:bg-black order-1 flex flex-col min-h-0">
                        <div className="p-4 lg:p-6 space-y-6 flex-shrink-0">
                            {/* Video Player */}
                            <div className="bg-gray-900 dark:bg-zinc-900 rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 aspect-video">
                                <ProtectedVideoPlayer
                                    ref={playerRef}
                                    videoUrl={videoToken.videoUrl}
                                    userEmail={videoToken.watermark.userEmail}
                                    userId={videoToken.watermark.userId}
                                    lessonId={lessonId}
                                    sessionId={videoToken.watermark.sessionId}
                                    ipAddress={videoToken.watermark.ipAddress}
                                    chaptersUrl={`/api/lessons/${lessonId}/chapters`}
                                    onTimeUpdate={handleTimeUpdate}
                                    onProgress={handleProgress}
                                    onComplete={handleComplete}
                                    initialTime={userProgress?.last_watched_second || 0}
                                />
                            </div>

                            {/* Lesson Info (Static) */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">{lesson.title}</h1>
                                    {Math.round(currentProgress) === 100 && (
                                        <span className="self-start flex items-center gap-2 text-green-600 dark:text-green-400 text-xs lg:text-sm font-medium px-3 py-1.5 bg-green-100 dark:bg-green-500/10 rounded-full flex-shrink-0">
                                            <CheckCircle className="w-4 h-4" />
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base leading-relaxed">
                                        {lesson.description || 'No description available for this lesson.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Tabs Sidebar) */}
                    <div className="w-full lg:flex-[3] border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col bg-gray-50 dark:bg-zinc-950 order-2 h-full overflow-hidden">

                        {/* Tabs Navigation */}
                        <div className="relative group/tabs">
                            <div
                                id="tab-rail"
                                className="px-2 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-black shrink-0 pb-2 relative flex-nowrap"
                            >
                                {[
                                    { id: 'playlist', label: 'Playlist', icon: ListVideo },
                                    { id: 'qa', label: 'Q&A', icon: MessageCircle },
                                    { id: 'resources', label: 'Resources', icon: Download },
                                    { id: 'notes', label: 'Notes', icon: FileText },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`
                                            flex-none flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap px-6 min-w-max
                                            ${activeTab === tab.id
                                                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }
                                        `}
                                        ref={activeTab === tab.id ? (el) => {
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                                            }
                                        } : null}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">

                            {/* Playlist Tab */}
                            {activeTab === 'playlist' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="mb-2 px-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Course Content • {allLessons.length} lessons
                                        </p>
                                    </div>
                                    {modules.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            Loading playlist...
                                        </div>
                                    ) : (
                                        modules.map((module) => {
                                            const isExpanded = expandedModules.includes(module.id)
                                            return (
                                                <div key={module.id} className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                                    <button
                                                        onClick={() => toggleModule(module.id)}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                                                            {module.title}
                                                        </div>
                                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="border-t border-gray-200 dark:border-zinc-800">
                                                            {module.lessons.map((moduleLesson, index) => {
                                                                const isCurrentLesson = moduleLesson.id === lessonId
                                                                const isCompleted = false // TODO: Real status
                                                                const isLocked = !moduleLesson.is_free && !isEnrolled
                                                                return (
                                                                    <button
                                                                        key={moduleLesson.id}
                                                                        ref={isCurrentLesson ? activeLessonRef : null}
                                                                        onClick={() => !isLocked && handleLessonClick(moduleLesson)}
                                                                        disabled={isLocked}
                                                                        className={`
                                                                            w-full text-left p-3 transition-all border-b border-gray-100 dark:border-zinc-800/50 last:border-0
                                                                            ${isCurrentLesson
                                                                                ? 'bg-purple-600/10 dark:bg-purple-500/20 border-l-4 border-l-purple-600'
                                                                                : isLocked
                                                                                    ? 'bg-gray-50 dark:bg-zinc-950 opacity-60 cursor-not-allowed'
                                                                                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                                                                            }
                                                                        `}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`
                                                                                w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
                                                                                ${isCurrentLesson ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'}
                                                                            `}>
                                                                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className={`font-medium text-sm line-clamp-2 ${isCurrentLesson ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                                    {moduleLesson.title}
                                                                                </div>
                                                                                <div className={`text-xs mt-1 flex items-center gap-2 ${isCurrentLesson ? 'text-purple-600/80 dark:text-purple-400/80' : 'text-gray-500'}`}>
                                                                                    {isCurrentLesson && <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Now playing</span>}
                                                                                    {moduleLesson.is_free && !isCurrentLesson && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs">FREE</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {/* Q&A Tab */}
                            {activeTab === 'qa' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <CommentSection
                                        lessonId={lessonId}
                                        comments={initialComments}
                                        currentUser={currentUser}
                                        currentTime={currentTime}
                                        onTimestampClick={handleTimestampClick}
                                    />
                                </div>
                            )}

                            {/* Resources Tab */}
                            {activeTab === 'resources' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 text-center">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Download className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No Resources</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            There are no downloadable resources for this lesson.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 text-center">
                                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Personal Notes</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Take timestamped notes while you watch.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
