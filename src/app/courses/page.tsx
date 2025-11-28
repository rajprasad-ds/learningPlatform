import { getPublishedCourses } from '@/actions/course-actions'
import Link from 'next/link'
import { BookOpen, Clock, PlayCircle, Star, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
    const courses = await getPublishedCourses()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="mb-8 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Courses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Discover new skills and advance your career with our expert-led courses.</p>
                </div>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                    {courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses available yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Check back soon for new content.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                            {courses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/courses/${course.id}`}
                                    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 flex flex-col"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <BookOpen className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <span className="text-white font-medium flex items-center gap-2">
                                                View Course <PlayCircle className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                            {course.description || 'No description available.'}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                                                    {course.profiles?.full_name?.charAt(0) || 'T'}
                                                </div>
                                                <span className="truncate max-w-[100px]">{course.profiles?.full_name || 'Instructor'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500" /> 4.9
                                                </span>
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                    ${course.price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
