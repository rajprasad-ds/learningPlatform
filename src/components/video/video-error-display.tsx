'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fixLessonVideoUrls } from '@/actions/video-actions'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VideoErrorDisplayProps {
    message: string
    courseId: string
}

export function VideoErrorDisplay({ message, courseId }: VideoErrorDisplayProps) {
    const [isFixing, setIsFixing] = useState(false)
    const [fixed, setFixed] = useState(false)
    const router = useRouter()

    const handleFix = async () => {
        setIsFixing(true)
        try {
            await fixLessonVideoUrls()
            setFixed(true)
            // Refresh the page to reload the video
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } catch (error) {
            console.error('Failed to fix data:', error)
            setIsFixing(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
            <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-zinc-800 max-w-md text-center w-full">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Video Unavailable</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>

                <div className="space-y-3">
                    <Link href={`/courses/${courseId}`} className="block w-full">
                        <button className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-xl transition-colors font-medium">
                            Back to Course
                        </button>
                    </Link>

                    {message.includes('not available') && (
                        <button
                            onClick={handleFix}
                            disabled={isFixing || fixed}
                            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 font-medium"
                        >
                            {isFixing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Fixing Test Data...
                                </>
                            ) : fixed ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Fixed! Reloading...
                                </>
                            ) : (
                                'Fix Test Data (Populate Videos)'
                            )}
                        </button>
                    )}
                </div>

                {message.includes('not available') && (
                    <p className="text-xs text-gray-400 mt-4">
                        This will add a test video to all lessons without one.
                    </p>
                )}
            </div>
        </div>
    )
}
