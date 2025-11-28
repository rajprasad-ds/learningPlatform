'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayCircle, Clock, Calendar, ArrowRight } from 'lucide-react'
import { Course, Lesson } from '@/types'

// --- MOCK DATA ---
const activeCourse: Course = {
    id: '1',
    title: 'Full Stack Web Development 2024',
    description: 'Master Next.js, Supabase, and Tailwind CSS',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    price: 99,
    is_published: true,
    teacher_id: 'teacher_1',
    created_at: new Date().toISOString()
}

const nextLesson: Lesson = {
    id: 'l1',
    module_id: 'm1',
    title: 'Understanding Server Actions',
    video_url: null,
    is_free: false,
    position: 1,
    type: 'video',
    created_at: new Date().toISOString()
}

const upcomingClasses = [
    { id: 1, title: 'System Design Live Q&A', time: 'Today, 4:00 PM', tutor: 'Sarah Smith' },
    { id: 2, title: 'React Hooks Deep Dive', time: 'Tomorrow, 2:00 PM', tutor: 'John Doe' },
]
// ----------------

import { useAuthStore } from '@/store/auth-store'

// ...

export default function DashboardPage() {
    const { user } = useAuthStore()

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋</h2>
                    <p className="text-muted-foreground">Here is what's happening with your courses today.</p>
                </div>
                <Button>Resume Learning</Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.5</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Continue Watching */}
                <Card className="col-span-4 border-none shadow-md bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                    <CardHeader>
                        <CardTitle>Continue Watching</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-start">
                            <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                <img src={activeCourse.thumbnail_url || ''} alt="Thumbnail" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <PlayCircle className="w-8 h-8 text-white opacity-80" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{activeCourse.title}</h3>
                                <p className="text-sm text-muted-foreground">Next: {nextLesson.title}</p>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full w-[65%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">65% Complete</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Live Classes */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Live Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                            LIVE
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">{cls.title}</p>
                                            <p className="text-xs text-muted-foreground">{cls.time} • {cls.tutor}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
