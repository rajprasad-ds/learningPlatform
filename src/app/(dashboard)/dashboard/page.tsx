import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayCircle, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { getLastWatchedLesson, getDashboardStats } from '@/actions/dashboard-actions'
import { getEnrolledCourses } from '@/actions/course-actions'
import { useAuthStore } from '@/store/auth-store'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
    const [lastWatched, stats, enrolledCourses] = await Promise.all([
        getLastWatchedLesson(),
        getDashboardStats(),
        getEnrolledCourses()
    ])

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back! 👋</h2>
                    <p className="text-muted-foreground">Here is what's happening with your courses today.</p>
                </div>
                {lastWatched && (
                    <Link href={`/courses/${lastWatched.courseId}/lessons/${lastWatched.lessonId}`}>
                        <Button>Resume Learning</Button>
                    </Link>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.coursesInProgress}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedLessons}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No upcoming live sessions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Continue Watching */}
                <div className="col-span-4 space-y-6">
                    <h3 className="text-xl font-semibold">Continue Watching</h3>
                    {lastWatched ? (
                        <Link href={`/courses/${lastWatched.courseId}/lessons/${lastWatched.lessonId}`}>
                            <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500/5 to-purple-500/5 hover:shadow-lg transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex gap-6 items-start">
                                        <div className="relative w-48 h-28 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-sm">
                                            {lastWatched.courseThumbnail ? (
                                                <Image
                                                    src={lastWatched.courseThumbnail}
                                                    alt="Thumbnail"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <PlayCircle className="w-10 h-10 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <PlayCircle className="w-6 h-6 text-purple-600 fill-purple-600" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 flex-1 py-1">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-1">
                                                    {lastWatched.lessonTitle}
                                                </h4>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {lastWatched.courseTitle} • {lastWatched.moduleTitle}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-purple-600">{lastWatched.progress}% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${lastWatched.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                    <PlayCircle className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">No activity yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">Start a course to see your progress here.</p>
                                <Link href="/dashboard/courses">
                                    <Button variant="outline">Browse Courses</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Enrolled Courses List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>My Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {enrolledCourses.slice(0, 3).map((course: any) => (
                                <Link key={course.id} href={`/courses/${course.id}`}>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            {course.thumbnail_url && (
                                                <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate group-hover:text-purple-600 transition-colors">
                                                {course.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{course.progress}%</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                            {enrolledCourses.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No enrolled courses.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
