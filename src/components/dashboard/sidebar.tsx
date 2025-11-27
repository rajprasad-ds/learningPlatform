'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, Calendar, Settings, TrendingUp, Award } from 'lucide-react'

const routes = [
    {
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        label: 'My Courses',
        icon: BookOpen,
        href: '/dashboard/courses',
    },
    {
        label: 'Progress',
        icon: TrendingUp,
        href: '/dashboard/progress',
    },
    {
        label: 'Achievements',
        icon: Award,
        href: '/dashboard/achievements',
    },
    {
        label: 'Schedule',
        icon: Calendar,
        href: '/dashboard/schedule',
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="py-6 px-3 space-y-2 bg-secondary/5 border-r border-gray-200 dark:border-gray-800">
            <div className="px-2 mb-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dashboard
                </h2>
            </div>
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                        pathname === route.href
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <route.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{route.label}</span>
                </Link>
            ))}
        </div>
    )
}
