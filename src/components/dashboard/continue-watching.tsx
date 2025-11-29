import Link from 'next/link'
import Image from 'next/image'
import { Play, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ContinueWatchingProps {
    lesson: {
        courseId: string
        courseTitle: string
        courseThumbnail: string | null
        lessonId: string
        lessonTitle: string
        progress: number
        moduleId: string
        moduleTitle: string
        isCourseCompleted?: boolean
    }
}

export function ContinueWatching({ lesson }: ContinueWatchingProps) {
    const isCompleted = lesson.isCourseCompleted
    const isStarted = lesson.progress > 0

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Continue Watching</h2>
            </div>


            <Link href={`/courses/${lesson.courseId}/lessons/${lesson.lessonId}`}>
                <Card className="overflow-hidden border border-black/5 dark:border-white/5 shadow-sm dark:shadow-2xl hover:shadow-md dark:hover:shadow-purple-900/20 transition-all duration-300 bg-primary/5 dark:bg-[#0f0518] text-card-foreground dark:text-white">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            {/* Large Thumbnail Section */}
                            <div className="relative w-full md:w-[400px] aspect-video shrink-0 overflow-hidden m-2 md:m-3 rounded-xl bg-black group">
                                {lesson.courseThumbnail ? (
                                    <Image
                                        src={lesson.courseThumbnail}
                                        alt={lesson.courseTitle}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-xl">
                                        <PlayCircle className="w-16 h-16 text-muted-foreground/50" />
                                    </div>
                                )}
                                {/* Dark Overlay for contrast - Stronger now */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors rounded-xl" />



                                {/* Overlay Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:bg-white/20">
                                        <Play className="w-10 h-10 text-white fill-white ml-1" />
                                    </div>
                                </div>

                                {/* Progress Bar on Thumbnail Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 backdrop-blur-sm rounded-b-xl overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 shadow-[0_0_12px_2px_rgba(168,85,247,0.8)]"
                                        style={{ width: `${lesson.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-primary/80 text-sm font-medium mb-1">
                                            <span>{lesson.courseTitle}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span>{lesson.moduleTitle}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                            {lesson.lessonTitle}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] transition-all duration-300">
                                            <Play className="w-5 h-5 mr-2 fill-current" />
                                            {isCompleted ? 'Replay Course' : isStarted ? 'Resume Lesson' : 'Start Lesson'}
                                        </Button>
                                        <div className="text-sm text-green-500 font-bold">
                                            {isCompleted ? 'Course Completed!' : `${lesson.progress}% Complete`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
