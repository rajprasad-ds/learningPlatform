'use client'

import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCourseStore } from '@/store/course-store'
import { useEffect } from 'react'

interface Course {
    id: string
    title: string
    description: string | null
    price: number
    thumbnail_url: string | null
    is_published: boolean
    created_at: string
}

export default function TeacherCoursesPage() {
    // We can sync with the store if we want, but for now let's just use React Query directly
    // for the list view as it handles caching/invalidation better.

    const { data: courses, isLoading } = useQuery<Course[]>({
        queryKey: ['teacher-courses'],
        queryFn: async () => {
            const res = await fetch('/api/teacher/courses')
            if (!res.ok) throw new Error('Failed to fetch courses')
            return res.json()
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your content and students</p>
                </div>
                <Link href="/teacher/courses/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-500/20">
                        <Plus className="w-5 h-5" />
                        Create New Course
                    </button>
                </Link>
            </div>

            {/* Course List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">Course</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {courses?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                                            <Plus className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium">No courses yet</p>
                                        <p className="text-sm">Create your first course to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            courses?.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                                                {course.thumbnail_url ? (
                                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">IMG</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {course.price === 0 ? (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">Free</span>
                                        ) : (
                                            `$${course.price}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.is_published
                                            ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/courses/${course.id}`}>
                                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <Link href={`/teacher/courses/${course.id}`}>
                                                <button className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
