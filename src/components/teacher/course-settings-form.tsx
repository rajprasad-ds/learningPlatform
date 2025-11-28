'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCourse, deleteCourse } from '@/actions/course-actions'
import { Loader2, Trash2, Save, AlertTriangle } from 'lucide-react'

interface CourseSettingsFormProps {
    course: {
        id: string
        title: string
        description: string | null
        price: number | null
        thumbnail_url: string | null
        is_published: boolean
    }
}

export function CourseSettingsForm({ course }: CourseSettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const data = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string) || 0,
                thumbnail_url: formData.get('thumbnail_url') as string,
                is_published: formData.get('is_published') === 'on'
            }

            await updateCourse(course.id, data)
            router.refresh()
        } catch (error) {
            console.error('Failed to update course:', error)
            alert('Failed to update course')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteCourse(course.id)
            router.push('/teacher/courses')
        } catch (error) {
            console.error('Failed to delete course:', error)
            alert('Failed to delete course')
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Course Settings</h2>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                            Course Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            defaultValue={course.title}
                            required
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
                            defaultValue={course.description || ''}
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
                                defaultValue={course.price || 0}
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
                                defaultValue={course.thumbnail_url || ''}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            defaultChecked={course.is_published}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <label htmlFor="is_published" className="text-sm font-medium text-gray-900 dark:text-white">
                            Publish this course
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Once you delete a course, there is no going back. Please be certain.
                </p>

                {showDeleteConfirm ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Confirm Delete
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Course
                    </button>
                )}
            </div>
        </div>
    )
}
