'use client'

import { useState, useRef } from 'react'
import { uploadVideoAction } from '@/actions/upload-actions'
import { Upload, CheckCircle, AlertTriangle, X } from 'lucide-react'

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
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setError('Please select a valid video file')
            return
        }

        // Validate file size (e.g., 500MB limit for now)
        if (file.size > 500 * 1024 * 1024) {
            setError('File size exceeds 500MB limit')
            return
        }

        setIsUploading(true)
        setError('')
        setSuccess(false)

        // Construct descriptive title for Bunny.net
        // Format: Course Name - Module Name - Lesson Name
        const videoTitle = `${courseTitle} - ${moduleTitle} - ${lessonTitle}`

        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', videoTitle)
        formData.append('lessonId', lessonId)

        try {
            const result = await uploadVideoAction(formData)
            if (result.success) {
                setSuccess(true)
                if (onUploadComplete) onUploadComplete()
            }
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

            {/* Custom Progress Bar UI */}
            {isUploading && (
                <div className="relative w-full h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-900/30">
                    {/* Animated Progress Bar */}
                    <div className="absolute inset-0 bg-purple-600/20 dark:bg-purple-600/30 w-full h-full animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent w-[200%] animate-[shimmer_2s_infinite] translate-x-[-100%]" />
                    </div>

                    {/* Centered Text */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider animate-pulse">
                            Uploading...
                        </span>
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
