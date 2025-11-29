import { getLastWatchedLesson, getDashboardStats } from '@/actions/dashboard-actions'
import { getEnrolledCourses } from '@/actions/course-actions'
import { ContinueWatching } from '@/components/dashboard/continue-watching'
import { CourseCard } from '@/components/dashboard/course-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Calendar } from 'lucide-react'

export default async function DashboardPage() {
    const [lastWatched, stats, enrolledCourses] = await Promise.all([
        getLastWatchedLesson(),
        getDashboardStats(),
        getEnrolledCourses()
    ])

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to your learning journey.</p>
            </div>

            {/* 1. Continue Watching (Top Priority) */}
            {lastWatched && (
                <section>
                    <ContinueWatching lesson={lastWatched} />
                </section>
            )}

            {/* 2. My Courses Grid */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
                </div>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {enrolledCourses.map((course: any) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                    </div>
                )}
            </section>

            {/* 3. Stats (Lower Priority) */}
            <section className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-muted-foreground">Overview</h3>
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
                            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3 Days</div>
                            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}

