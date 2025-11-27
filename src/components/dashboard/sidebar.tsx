'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, Calendar, Settings, LogOut, MonitorPlay } from 'lucide-react'

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: 'text-sky-500',
    },
    {
        label: 'My Courses',
        icon: BookOpen,
        href: '/dashboard/courses',
        color: 'text-violet-500',
    },
    {
        label: 'Schedule',
        icon: Calendar,
        href: '/dashboard/schedule',
        color: 'text-pink-700',
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
        color: 'text-gray-500',
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-secondary/10 border-r border-border/40">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <MonitorPlay className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">
                        Lumina
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
