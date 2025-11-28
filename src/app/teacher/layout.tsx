'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, Settings, LogOut, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        {
            label: 'Dashboard',
            href: '/teacher',
            icon: LayoutDashboard
        },
        {
            label: 'Courses',
            href: '/teacher/courses',
            icon: BookOpen
        },
        {
            label: 'Analytics',
            href: '/teacher/analytics',
            icon: BarChart3
        },
        {
            label: 'Settings',
            href: '/teacher/settings',
            icon: Settings
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <Link href="/teacher" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
                        <LayoutDashboard className="w-6 h-6 text-purple-600" />
                        <span>Teacher Studio</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href === '/teacher'
                            ? pathname === '/teacher'
                            : pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                                    ${isActive
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
