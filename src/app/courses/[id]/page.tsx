import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, PlayCircle, Lock, CheckCircle, ChevronLeft, Shield, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { EnrollButton } from '@/components/courses/enroll-button'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Get course details
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
      *,
      profiles!courses_teacher_id_fkey(full_name, avatar_url)
    `)
        .eq('id', id)
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
        .eq('course_id', id)
        .order('position')

    // Check if user is enrolled
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false

    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single()

        isEnrolled = !!enrollment
    }

    const totalLessons = modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0
    const totalDuration = totalLessons * 15 // Assume 15 min per lesson (placeholder)

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-background page-enter">
            {/* Hero Section */}
            <div className="relative bg-purple-50/50 dark:bg-gray-900 pt-32 pb-12 px-8 lg:px-12 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-purple-500/5 to-transparent dark:from-purple-900/50 dark:via-purple-900/20 dark:to-black/50"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Back Button */}
                    <Link href="/courses" className="inline-block mb-8">
                        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to All Courses</span>
                        </button>
                    </Link>

                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 mb-4 text-sm font-medium uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Course Overview</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900 dark:text-white">{course.title}</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl max-w-2xl mb-8 leading-relaxed">
                        {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                                {course.profiles?.full_name?.charAt(0) || 'T'}
                            </div>
                            <span>{course.profiles?.full_name || 'Instructor'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            <span>~{Math.floor(totalDuration / 60)} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            <span>{totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                            <span>4.9 (120 reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Content */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                                Course Curriculum
                            </h2>

                            <div className="space-y-6">
                                {modules?.map((module, moduleIndex) => (
                                    <div key={module.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Module {moduleIndex + 1}: {module.title}
                                            </h3>
                                            <span className="text-xs font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full">
                                                {module.lessons?.length || 0} lessons
                                            </span>
                                        </div>

                                        <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
                                            {module.lessons?.sort((a: any, b: any) => a.position - b.position).map((lesson: any, lessonIndex: number) => (
                                                <Link
                                                    key={lesson.id}
                                                    href={isEnrolled || lesson.is_free ? `/courses/${id}/lessons/${lesson.id}` : '#'}
                                                    className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${!isEnrolled && !lesson.is_free ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                                                            ${isEnrolled || lesson.is_free
                                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                            }
                                                        `}>
                                                            {lessonIndex + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                                {lesson.title}
                                                                {lesson.is_free && !isEnrolled && (
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                                        Free Preview
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                                {lesson.type === 'video' ? 'Video Lesson' : lesson.type === 'live' ? 'Live Class' : 'Quiz'} • 15 min
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                        {isEnrolled ? (
                                                            <PlayCircle className="w-5 h-5" />
                                                        ) : lesson.is_free ? (
                                                            <PlayCircle className="w-5 h-5" />
                                                        ) : (
                                                            <Lock className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Enrollment Card */}
                    <div className="lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                <div className="p-6">
                                    {!isEnrolled ? (
                                        <>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{course.price}</span>
                                                <span className="text-gray-500 dark:text-gray-400 line-through text-lg">₹{course.price * 2}</span>
                                                <span className="ml-auto text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">50% OFF</span>
                                            </div>

                                            <EnrollButton courseId={course.id} price={course.price} />

                                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
                                                30-day money-back guarantee • Lifetime access
                                            </p>
                                        </>
                                    ) : (
                                        <div className="mb-6">
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-green-800 dark:text-green-200">Enrolled</div>
                                                    <div className="text-xs text-green-600 dark:text-green-400">You have full access</div>
                                                </div>
                                            </div>

                                            <Link href={`/courses/${id}/lessons/${modules?.[0]?.lessons?.[0]?.id}`}>
                                                <button className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                    Continue Learning
                                                </button>
                                            </Link>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <PlayCircle className="w-4 h-4 text-purple-500" />
                                            <span>{totalLessons} video lessons</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Clock className="w-4 h-4 text-purple-500" />
                                            <span>Full lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Shield className="w-4 h-4 text-purple-500" />
                                            <span>Certificate of completion</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span>Premium community access</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
