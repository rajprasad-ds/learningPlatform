import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, PlayCircle, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function CoursePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Get course details
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
      *,
      profiles!courses_teacher_id_fkey(full_name, avatar_url)
    `)
        .eq('id', params.id)
        .single()

    if (error || !course) {
        notFound()
    }

    // Get modules and lessons
    const { data: modules } = await supabase
        .from('modules')
        .select(`
      *,
      lessons(*)
    `)
        .eq('course_id', params.id)
        .order('position')

    // Check if user is enrolled
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false

    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', params.id)
            .single()

        isEnrolled = !!enrollment
    }

    const totalLessons = modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0
    const totalDuration = totalLessons * 15 // Assume 15 min per lesson (placeholder)

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Course Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                            <p className="text-muted-foreground text-lg">{course.description}</p>
                        </div>
                        {!isEnrolled && (
                            <Card className="w-80">
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold mb-4">₹{course.price}</div>
                                    <Button className="w-full" size="lg">
                                        Enroll Now
                                    </Button>
                                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <PlayCircle className="w-4 h-4" />
                                            {totalLessons} lessons
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            ~{Math.floor(totalDuration / 60)} hours
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {course.profiles?.full_name?.charAt(0) || 'T'}
                        </div>
                        <div>
                            <div className="font-medium">{course.profiles?.full_name || 'Instructor'}</div>
                            <div className="text-sm text-muted-foreground">Course Instructor</div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Course Content</h2>

                    {modules?.map((module, moduleIndex) => (
                        <Card key={module.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>
                                        Module {moduleIndex + 1}: {module.title}
                                    </span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {module.lessons?.length || 0} lessons
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {module.lessons?.sort((a, b) => a.position - b.position).map((lesson, lessonIndex) => (
                                        <Link
                                            key={lesson.id}
                                            href={isEnrolled || lesson.is_free ? `/courses/${params.id}/lessons/${lesson.id}` : '#'}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isEnrolled || lesson.is_free
                                                    ? 'hover:bg-accent cursor-pointer'
                                                    : 'opacity-60 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                                                    {lessonIndex + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {lesson.title}
                                                        {lesson.is_free && (
                                                            <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                                                                FREE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {lesson.type === 'video' ? 'Video Lesson' : lesson.type === 'live' ? 'Live Class' : 'Quiz'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isEnrolled || lesson.is_free ? (
                                                    <PlayCircle className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
