'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedVideoPlayer } from '@/components/video/protected-video-player'
import { markLessonComplete, trackVideoProgress } from '@/actions/video-actions'
import {
    ChevronLeft, CheckCircle, Lock, PlayCircle, ChevronDown, ChevronRight,
    FileText, MessageCircle, BookOpen, Download, AlertCircle
} from 'lucide-react'
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
    isEnrolled: boolean
}

type Tab = 'overview' | 'resources' | 'qa' | 'notes'

export function LessonContent({
    lesson,
    videoToken,
    modules,
    allLessons,
    initialCompleted,
    courseId,
    lessonId,
    isEnrolled
}: LessonContentProps) {
    const router = useRouter()
    const [completed, setCompleted] = useState(initialCompleted)
    const [expandedModules, setExpandedModules] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const activeLessonRef = useRef<HTMLButtonElement>(null)

    // Initialize expanded modules and scroll to active lesson
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
                    <div className="w-full lg:flex-[7] lg:overflow-y-auto bg-white dark:bg-black order-1 flex flex-col">
                        <div className="p-4 lg:p-6 space-y-6 flex-shrink-0">
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
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-4 lg:px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-6 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'overview', label: 'Overview', icon: BookOpen },
                                { id: 'resources', label: 'Resources', icon: Download },
                                { id: 'qa', label: 'Q&A', icon: MessageCircle },
                                { id: 'notes', label: 'Notes', icon: FileText },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`
                                        flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }
                                    `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 lg:p-6 flex-1">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">{lesson.title}</h1>
                                        {completed && (
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
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                            {activeTab === 'qa' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 text-center">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Q&A Coming Soon</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Ask questions and discuss with your peers.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                            <div className="space-y-4">
                                {modules.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        Loading playlist...
                                    </div>
                                ) : (
                                    modules.map((module) => {
                                        const isExpanded = expandedModules.includes(module.id)

                                        return (
                                            <div key={module.id} className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                                {/* Module Header (Accordion Trigger) */}
                                                <button
                                                    onClick={() => toggleModule(module.id)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                        {module.title}
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>

                                                {/* Lessons (Collapsible) */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 dark:border-zinc-800">
                                                        {module.lessons.map((moduleLesson, index) => {
                                                            const isCurrentLesson = moduleLesson.id === lessonId
                                                            // TODO: Pass actual completion status from server
                                                            const isCompleted = false
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
                                                                            ${isCurrentLesson
                                                                                ? 'bg-purple-600 text-white'
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
                                                                                ${isCurrentLesson ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}
                                                                            `}>
                                                                                {moduleLesson.title}
                                                                            </div>
                                                                            <div className={`
                                                                                text-xs mt-1 flex items-center gap-2
                                                                                ${isCurrentLesson ? 'text-purple-600/80 dark:text-purple-400/80' : 'text-gray-500'}
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
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
