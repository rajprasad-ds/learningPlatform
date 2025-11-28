'use client'

import { useState, useRef } from 'react'
import { createVideoEntry, updateLessonVideo } from '@/actions/video-actions'
import { Upload, CheckCircle, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VideoUploaderProps {
    lessonId: string
    courseTitle: string
    moduleTitle: string
    lessonTitle: string
    currentVideoUrl?: string | null
    onUploadComplete?: () => void
}

export function VideoUploader({
    lessonId,
    courseTitle,
    moduleTitle,
    lessonTitle,
    currentVideoUrl,
    onUploadComplete
}: VideoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

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

        setIsUploading(true)
        setUploadProgress(0)
        setError('')
        setSuccess(false)

        try {
            // 1. Create Video Entry
            const videoTitle = `${courseTitle} - ${moduleTitle} - ${lessonTitle}`
            const { videoId, success: createSuccess } = await createVideoEntry(videoTitle)

            if (!createSuccess || !videoId) {
                throw new Error('Failed to initialize upload')
            }

            // 2. Upload File via XHR to track progress
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', `/api/upload?videoId=${videoId}`)

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100
                        setUploadProgress(Math.round(percentComplete))
                    }
                }

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        // 3. Update Lesson Record (using existing action logic or new one)
                        // We need to link the videoId to the lesson in Supabase
                        // Since we bypassed uploadVideoAction, we need a way to update the lesson.
                        // We can reuse uploadVideoAction but pass the videoId directly?
                        // Or better, create a specific action to link video.
                        // For now, let's use a FormData hack to reuse uploadVideoAction logic OR just call a new action.
                        // Actually, uploadVideoAction expects a file. We should create a `linkVideoToLesson` action.
                        // But to save time, I'll use a new server action here.

                        // Let's assume updateLessonVideo(lessonId, videoId) exists.
                        await updateLessonVideo(lessonId, videoId)
                        resolve()
                    } else {
                        reject(new Error('Upload failed'))
                    }
                }

                xhr.onerror = () => reject(new Error('Network error'))
                xhr.send(file)
            })

            setSuccess(true)
            if (onUploadComplete) onUploadComplete()
            router.refresh()

        } catch (err) {
            console.error(err)
            setError('Failed to upload video. Please try again.')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="space-y-4">
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

            {/* Real Progress Bar UI */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
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
