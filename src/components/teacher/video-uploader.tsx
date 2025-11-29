'use client'

import { useState, useRef } from 'react'
import { createVideoEntry, updateLessonVideo, saveLessonChapters } from '@/actions/video-actions'
import { Upload, CheckCircle, AlertTriangle, X, Save, Loader2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useUploadStore } from '@/stores/upload-store'

interface VideoUploaderProps {
    lessonId: string
    courseTitle: string
    moduleTitle: string
    lessonTitle: string
    currentVideoUrl?: string | null
    initialChapters?: { title: string, startTime: number }[]
    onUploadComplete?: () => void
}

export function VideoUploader({
    lessonId,
    courseTitle,
    moduleTitle,
    lessonTitle,
    currentVideoUrl,
    initialChapters = [],
    onUploadComplete
}: VideoUploaderProps) {
    const { startUpload, isUploading: isGlobalUploading, lessonId: uploadingLessonId, progress: globalProgress } = useUploadStore()
    const [isSavingChapters, setIsSavingChapters] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const pathname = usePathname()

    // Check if this specific uploader instance is the one currently uploading
    const isThisUploading = isGlobalUploading && uploadingLessonId === lessonId

    const [chapters, setChapters] = useState<{ title: string, startTime: number }[]>(initialChapters)
    const [newChapterTitle, setNewChapterTitle] = useState('')
    const [newChapterTime, setNewChapterTime] = useState('')

    const parseTime = (timeStr: string) => {
        const parts = timeStr.split(':')
        if (parts.length === 1) return parseInt(parts[0]) || 0
        const [mm, ss] = parts.map(Number)
        return (mm || 0) * 60 + (ss || 0)
    }

    const formatTime = (seconds: number) => {
        const mm = Math.floor(seconds / 60)
        const ss = seconds % 60
        return `${mm}:${ss.toString().padStart(2, '0')}`
    }

    const addChapter = () => {
        if (!newChapterTitle || !newChapterTime) return
        const startTime = parseTime(newChapterTime)
        setChapters(prev => [...prev, { title: newChapterTitle, startTime }].sort((a, b) => a.startTime - b.startTime))
        setNewChapterTitle('')
        setNewChapterTime('')
    }

    const removeChapter = (index: number) => {
        setChapters(prev => prev.filter((_, i) => i !== index))
    }

    const handleSaveChapters = async () => {
        setIsSavingChapters(true)
        try {
            await saveLessonChapters(lessonId, chapters)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
            router.refresh()
        } catch (err) {
            console.error('Failed to save chapters:', err)
            setError('Failed to save chapters')
        } finally {
            setIsSavingChapters(false)
        }
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setError('Please select a valid video file')
            return
        }

        // Validate file size (e.g., 2GB limit)
        if (file.size > 2 * 1024 * 1024 * 1024) {
            setError('File size exceeds 2GB limit')
            return
        }

        setError('')
        setSuccess(false)

        try {
            await startUpload(file, {
                lessonId,
                lessonTitle,
                courseTitle,
                moduleTitle,
                chapters,
                originPath: pathname
            })

            // Show immediate feedback that background upload started
            if (onUploadComplete) onUploadComplete()

        } catch (err) {
            console.error(err)
            setError('Failed to start upload')
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Chapters Editor */}
            <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Video Chapters</h3>
                    <span className="text-xs text-gray-500">Optional</span>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Chapter Title"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        className="flex-1 text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                    <input
                        type="text"
                        placeholder="MM:SS"
                        value={newChapterTime}
                        onChange={(e) => setNewChapterTime(e.target.value)}
                        className="w-24 text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                    <button
                        onClick={addChapter}
                        type="button"
                        className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                    >
                        Add
                    </button>
                </div>

                {chapters.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-zinc-800 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-gray-500">{formatTime(chapter.startTime)}</span>
                                    <span className="font-medium">{chapter.title}</span>
                                </div>
                                <button
                                    onClick={() => removeChapter(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {chapters.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveChapters}
                            disabled={isSavingChapters}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingChapters ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Chapters
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Current Video Status */}
            {currentVideoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">Video Uploaded</p>
                        <p className="text-xs text-green-700 dark:text-green-400 truncate">{currentVideoUrl}</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                        Replace
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-full">
                        <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No video content</p>
                        <p className="text-xs text-gray-500">Upload a video for this lesson</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        Upload
                    </button>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
            />

            {/* Local Progress Bar UI - Only visible if THIS uploader is active */}
            {isThisUploading && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>Uploading...</span>
                        <span>{globalProgress}%</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
                    <button onClick={() => setError('')}>
                        <X className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}

            {/* Success State */}
            {success && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-700 dark:text-green-300">Upload successful!</p>
                </div>
            )}
        </div>
    )
}
