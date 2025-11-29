import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, BookOpen, ArrowRight, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CourseCardProps {
    course: {
        id: string
        title: string
        thumbnail_url: string | null
        progress: number
        totalLessons: number
        completedLessons: number
        nextLesson: {
            id: string
            title: string
            moduleId: string
        } | null
    }
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden flex flex-col h-full bg-card cursor-pointer">
            {/* Full Width Thumbnail with Padding and Border */}
            <div className="p-3 pb-0">
                <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
                    {course.thumbnail_url ? (
                        <Image
                            src={course.thumbnail_url}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <BookOpen className="w-10 h-10" />
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 border-b border-border/50">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                    <span className="font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                        {course.completedLessons}/{course.totalLessons} Lessons
                    </span>
                </div>
            </div>

            {/* Next Up Section */}
            <CardContent className="p-4 flex-1 flex flex-col justify-end">
                {course.nextLesson ? (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Next Up
                        </p>
                        <Link href={`/courses/${course.id}/lessons/${course.nextLesson.id}`}>
                            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-primary/5 transition-colors group/lesson cursor-pointer border border-transparent hover:border-primary/10">
                                <div className="relative w-10 h-10 rounded bg-muted shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover/lesson:shadow-md transition-all">
                                    {/* Small Thumbnail Placeholder or Icon */}
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center group-hover/lesson:bg-primary/20 transition-colors">
                                        <PlayCircle className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1 group-hover/lesson:text-primary transition-colors">
                                        {course.nextLesson.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground group-hover/lesson:text-primary/70 transition-colors">
                                        Resume
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/lesson:translate-x-1 group-hover/lesson:text-primary transition-all" />
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Course Completed!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
