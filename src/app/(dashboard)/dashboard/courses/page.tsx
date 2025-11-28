'use client'

import { useEffect, useState } from 'react'
import { getEnrolledCourses } from '@/actions/course-actions'
import Link from 'next/link'
import { BookOpen, Clock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
                <Link
                    href="/courses"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                    Browse Courses
                </Link>
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
                        <Link href={`/courses/${course.id}`}>
                            <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}

                                    {/* Progress Badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
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
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
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

                                    {/* Continue Button */}
                                    <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
                                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
