import Link from 'next/link'
import { BookOpen, Clock, Users } from 'lucide-react'

interface CourseCardProps {
    course: {
        id: string
        title: string
        description: string | null
        price: number
        thumbnail_url: string | null
        teacher_id: string
        // Add other fields as needed
    }
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Link href={`/courses/${course.id}`} className="group block h-full">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
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

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${course.price === 0
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-black text-gray-900 dark:text-white'
                            }`}>
                            {course.price === 0 ? 'FREE' : `$${course.price}`}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                        {course.description || 'No description available.'}
                    </p>

                    {/* Meta Info (Placeholder for now) */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-auto">
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>0 Students</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>0h 0m</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
