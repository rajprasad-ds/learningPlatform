'use client'

import { CourseCard } from '@/components/courses/course-card'
import { Search, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface Course {
    id: string
    title: string
    description: string | null
    price: number
    thumbnail_url: string | null
    teacher_id: string
    is_published: boolean
    created_at: string
}

export default function ExploreProblemsPage() {
    const { data: courses, isLoading } = useQuery<Course[]>({
        queryKey: ['public-courses'],
        queryFn: async () => {
            const res = await fetch('/api/courses')
            if (!res.ok) throw new Error('Failed to fetch courses')
            return res.json()
        }
    })

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Explore Courses
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Master complex topics with our premium, in-depth courses designed for serious learners.
                    </p>
                </div>

                {/* Search / Filter (Placeholder) */}
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No courses found. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
