'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourse } from '@/actions/course-actions'
import { ChevronLeft, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function CreateCoursePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError('')

        try {
            const result = await createCourse(formData)
            if (result.success) {
                router.push(`/teacher/courses/${result.courseId}`)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to create course. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Courses
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Start building your new curriculum.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm">
                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Advanced React Patterns"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            placeholder="What will students learn in this course?"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium text-gray-900 dark:text-white">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                min="0"
                                step="0.01"
                                defaultValue="0"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="thumbnail_url" className="text-sm font-medium text-gray-900 dark:text-white">
                                Thumbnail URL
                            </label>
                            <input
                                type="url"
                                id="thumbnail_url"
                                name="thumbnail_url"
                                placeholder="https://..."
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Link href="/teacher/courses">
                            <button type="button" className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Course'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
