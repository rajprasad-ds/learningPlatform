'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createModule, createLesson } from '@/actions/course-actions'
import { Plus, GripVertical, ChevronDown, ChevronRight, Video, Loader2 } from 'lucide-react'
import { VideoUploader } from './video-uploader'

interface Lesson {
    id: string
    title: string
    position: number
    type: string
    is_free: boolean
    video_url?: string | null
}

interface Module {
    id: string
    title: string
    position: number
    lessons: Lesson[]
}

interface CurriculumBuilderProps {
    courseId: string
    initialModules: Module[]
}

export function CurriculumBuilder({ courseId, initialModules }: CurriculumBuilderProps) {
    const router = useRouter()
    const [modules, setModules] = useState(initialModules)
    const [expandedModules, setExpandedModules] = useState<string[]>(initialModules.map(m => m.id))
    const [expandedLessons, setExpandedLessons] = useState<string[]>([])
    const [isCreatingModule, setIsCreatingModule] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState('')
    const [creatingLessonInModule, setCreatingLessonInModule] = useState<string | null>(null)
    const [newLessonTitle, setNewLessonTitle] = useState('')

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const toggleLesson = (lessonId: string) => {
        setExpandedLessons(prev =>
            prev.includes(lessonId)
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId]
        )
    }

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return
        setIsCreatingModule(true)
        try {
            const position = modules.length + 1
            await createModule(courseId, newModuleTitle, position)
            setNewModuleTitle('')
            router.refresh()
        } catch (error) {
            console.error('Failed to create module:', error)
        } finally {
            setIsCreatingModule(false)
        }
    }

    const handleCreateLesson = async (moduleId: string) => {
        if (!newLessonTitle.trim()) return

        const module = modules.find(m => m.id === moduleId)
        if (!module) return

        try {
            const position = (module.lessons?.length || 0) + 1
            await createLesson(moduleId, newLessonTitle, position)
            setNewLessonTitle('')
            setCreatingLessonInModule(null)
            router.refresh()
        } catch (error) {
            console.error('Failed to create lesson:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Modules List */}
            <div className="space-y-4">
                {initialModules.map((module) => (
                    <div key={module.id} className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        {/* Module Header */}
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                            <button onClick={() => toggleModule(module.id)}>
                                {expandedModules.includes(module.id) ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            <div className="font-medium text-gray-900 dark:text-white flex-1">
                                {module.title}
                            </div>
                            <div className="text-sm text-gray-500">
                                {module.lessons?.length || 0} lessons
                            </div>
                        </div>

                        {/* Lessons List */}
                        {expandedModules.includes(module.id) && (
                            <div className="p-4 space-y-3">
                                {module.lessons?.map((lesson) => (
                                    <div key={lesson.id} className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                        <div className="flex items-center gap-3 p-3 group hover:border-purple-500/50 transition-colors">
                                            <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 font-medium text-sm text-gray-700 dark:text-gray-200">
                                                {lesson.title}
                                            </div>
                                            <button
                                                onClick={() => toggleLesson(lesson.id)}
                                                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                                            >
                                                {expandedLessons.includes(lesson.id) ? 'Close' : 'Edit Content'}
                                            </button>
                                        </div>

                                        {/* Lesson Content Editor */}
                                        {expandedLessons.includes(lesson.id) && (
                                            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Video Content</h4>
                                                <VideoUploader
                                                    lessonId={lesson.id}
                                                    currentVideoUrl={lesson.video_url}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Lesson Form */}
                                {creatingLessonInModule === module.id ? (
                                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-purple-500">
                                        <input
                                            type="text"
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            placeholder="Lesson title..."
                                            className="flex-1 px-3 py-1.5 bg-transparent outline-none text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateLesson(module.id)}
                                        />
                                        <button
                                            onClick={() => handleCreateLesson(module.id)}
                                            className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-md font-medium"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => setCreatingLessonInModule(null)}
                                            className="px-3 py-1.5 text-gray-500 text-xs hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setCreatingLessonInModule(module.id)}
                                        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 hover:border-purple-300 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Lesson
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Module Form */}
            <div className="pt-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="New Module Title..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateModule()}
                    />
                    <button
                        onClick={handleCreateModule}
                        disabled={isCreatingModule || !newModuleTitle.trim()}
                        className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isCreatingModule ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Add Module
                    </button>
                </div>
            </div>
        </div>
    )
}
