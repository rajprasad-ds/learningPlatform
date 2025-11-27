'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import {
    Home,
    BookOpen,
    FileText,
    BookMarked,
    Calendar,
    User,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const sidebarItems = [
    { name: 'Overview', path: '/dashboard', icon: Home },
    { name: 'My Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Assignments', path: '/dashboard/assignments', icon: FileText },
    { name: 'Reader', path: '/dashboard/reader', icon: BookMarked },
    { name: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault()
                toggleSidebarCollapse()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebarCollapse])

    return (
        <motion.aside
            initial={false}
            animate={{
                width: sidebarCollapsed ? '64px' : '240px',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative h-full border-r border-gray-200/50 dark:border-gray-700/50"
        >
            <button
                onClick={toggleSidebarCollapse}
                className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white shadow-lg transition-colors z-10"
            >
                {sidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            <nav className="flex flex-col gap-1 p-3 pt-16">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.path
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "relative flex items-center rounded-full transition-all duration-200",
                                sidebarCollapsed
                                    ? "w-10 h-10 justify-center"
                                    : "gap-3 px-3 py-2.5",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-purple-600 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <Icon className={cn(
                                "w-5 h-5 relative z-10 flex-shrink-0",
                                isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                            )} />

                            {!sidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative z-10 font-medium text-sm whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {!sidebarCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 left-0 right-0 px-4"
                >
                    <div className="text-xs text-muted-foreground text-center bg-white/5 rounded-lg py-2 px-3">
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
                            {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                        </kbd>
                        {' + '}
                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">B</kbd>
                        {' to toggle'}
                    </div>
                </motion.div>
            )}
        </motion.aside>
    )
}
