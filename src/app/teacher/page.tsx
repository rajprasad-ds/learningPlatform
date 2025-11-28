'use client'

import Link from 'next/link'
import { BookOpen, Users, DollarSign, Plus, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'

export default function TeacherDashboardPage() {
    const { user } = useAuthStore()

    const { data: stats, isLoading } = useQuery({
        queryKey: ['teacher-stats'],
        queryFn: async () => {
            const res = await fetch('/api/teacher/stats')
            if (!res.ok) throw new Error('Failed to fetch stats')
            return res.json()
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.user_metadata?.full_name || 'Teacher'}</p>
                </div>
                <Link href="/teacher/courses/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        Create Course
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.courseCount || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.studentCount || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                            <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${stats?.revenue || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Placeholder */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No recent activity to show.
                </div>
            </div>
        </div>
    )
}
