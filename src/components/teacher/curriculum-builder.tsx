'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createModule, createLesson } from '@/actions/course-actions'
import { VideoUploader } from './video-uploader'
import { ChevronDown, ChevronRight, GripVertical, Plus, Video, Trash2, Edit2 } from 'lucide-react'

interface Module {
    id: string
    title: string
    position: number
    lessons: Lesson[]
}

interface Lesson {
    id: string
    title: string
    position: number
    video_url: string | null
    is_free: boolean
    chapters?: { title: string, startTime: number }[]
}

interface CurriculumBuilderProps {
    courseId: string
    courseTitle: string
    initialModules: Module[]
}

export function CurriculumBuilder({ courseId, courseTitle, initialModules }: CurriculumBuilderProps) {
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
                                                    courseTitle={courseTitle}
                                                    moduleTitle={module.title}
                                                    lessonTitle={lesson.title}
                                                    currentVideoUrl={lesson.video_url}
                                                    initialChapters={lesson.chapters}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Create Lesson Form */}
                                {creatingLessonInModule === module.id ? (
                                    <div className="flex items-center gap-2 p-2">
                                        <input
                                            type="text"
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            placeholder="Lesson title..."
                                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateLesson(module.id)}
                                        />
                                        <button
                                            onClick={() => handleCreateLesson(module.id)}
                                            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => setCreatingLessonInModule(null)}
                                            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setCreatingLessonInModule(module.id)}
                                        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg hover:border-purple-200 dark:hover:border-purple-900 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Lesson
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Create Module Form */}
                {isCreatingModule ? (
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                placeholder="Module title..."
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateModule()}
                            />
                            <button
                                onClick={handleCreateModule}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
                            >
                                Create Module
                            </button>
                            <button
                                onClick={() => setIsCreatingModule(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreatingModule(true)}
                        className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl hover:border-purple-200 dark:hover:border-purple-900 transition-all font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Module
                    </button>
                )}
            </div>
        </div>
    )
}
