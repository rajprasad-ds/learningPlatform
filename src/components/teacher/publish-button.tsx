'use client'

import { useState } from 'react'
import { publishCourse } from '@/actions/course-actions'
import { Loader2, Globe, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PublishButtonProps {
    courseId: string
    isPublished: boolean
}

export function PublishButton({ courseId, isPublished }: PublishButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleToggle() {
        setIsLoading(true)
        try {
            await publishCourse(courseId, !isPublished)
            router.refresh()
        } catch (error) {
            console.error('Failed to toggle publish status:', error)
            alert('Failed to update course status')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isPublished
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'
                }
            `}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPublished ? (
                <Lock className="w-4 h-4" />
            ) : (
                <Globe className="w-4 h-4" />
            )}
            {isPublished ? 'Unpublish' : 'Publish Course'}
        </button>
    )
}
