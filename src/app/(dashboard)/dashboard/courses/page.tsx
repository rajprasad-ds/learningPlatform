'use client'

import { useEffect, useState } from 'react'
import { getEnrolledCourses } from '@/actions/course-actions'
import { BookOpen, Clock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLoadingStore } from '@/store/loading-store'

interface Course {
    id: string
    title: string
    description: string
    thumbnail_url: string | null
    progress: number
    totalLessons: number
    completedLessons: number
    enrolledAt: string
}

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const setGlobalLoading = useLoadingStore((state) => state.setLoading)

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            const data = await getEnrolledCourses()
            setCourses(data as Course[])
        } catch (error) {
            console.error('Failed to load courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCourseClick = (courseId: string) => {
        // Only show loading if navigation takes longer than 500ms (slow connection)
        setTimeout(() => {
            setGlobalLoading(true, 'Loading course...')
        }, 500)

        router.push(`/courses/${courseId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Courses Yet</h2>
                <p className="text-muted-foreground mb-6">
                    You haven't enrolled in any courses. Start learning today!
                </p>
                <button
                    onClick={() => {
                        setTimeout(() => {
                            setGlobalLoading(true, 'Loading courses...')
                        }, 500)
                        router.push('/courses')
                    }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all font-medium hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
                >
                    Browse Courses
                </button>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                <p className="text-muted-foreground">
                    Continue your learning journey
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div
                            onClick={() => handleCourseClick(course.id)}
                            className="cursor-pointer group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-purple-100 dark:bg-purple-900/20 overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-purple-400 dark:text-purple-600" />
                                    </div>
                                )}

                                {/* Progress Badge */}
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-900 dark:text-white text-sm font-medium border border-gray-200 dark:border-gray-700">
                                    {course.progress}%
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                                    {course.title}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{course.completedLessons}/{course.totalLessons} lessons</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.progress}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full bg-purple-600 rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{course.totalLessons} lessons</span>
                                    </div>
                                </div>

                                {/* Purple Pill Button with Glow */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleCourseClick(course.id)
                                    }}
                                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
                                >
                                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
