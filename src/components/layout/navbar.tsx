'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, LogOut } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [hoveredPath, setHoveredPath] = useState<string | null>(null)
    const { user, loading, signOut } = useAuthStore()

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    // Dynamic nav items based on auth status
    const publicNavItems = [
        { name: 'Home', path: '/' },
        { name: 'Explore Problems', path: '/explore-problems' },
        { name: 'Challenges', path: '/challenges' },
        { name: 'Resources', path: '/resources' },
        { name: 'Community', path: '/community' },
    ]

    const authenticatedNavItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Courses', path: '/courses' },
        { name: 'Explore', path: '/explore-problems' },
        { name: 'Challenges', path: '/challenges' },
        { name: 'Community', path: '/community' },
    ]

    const navItems = user ? authenticatedNavItems : publicNavItems

    return (
        <nav className="fixed top-0 w-full z-50 pt-4 px-4 transition-all duration-300">
            <div className="container mx-auto relative flex items-center justify-center h-14">

                {/* 1. Logo Island (Absolute Left) */}
                <div className="absolute left-0 flex items-center gap-2 p-1.5 pl-3 pr-4 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-sm">
                    <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Zap className="w-4 h-4 text-primary absolute z-10" />
                            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-bold text-base tracking-tight text-foreground hidden sm:block">
                            Invincible<span className="text-primary">Mechanics</span>
                        </span>
                    </Link>
                </div>

                {/* 2. Navigation Island (Centered) */}
                <div className="hidden md:flex items-center p-1 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-sm z-10">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                onMouseEnter={() => setHoveredPath(item.path)}
                                onMouseLeave={() => setHoveredPath(null)}
                            >
                                {(isActive || hoveredPath === item.path) && (
                                    <motion.div
                                        layoutId="navbar-active-tab"
                                        className="absolute inset-0 bg-purple-600 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.6)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* 3. Actions Island (Absolute Right) */}
                <div className="absolute right-0 flex items-center gap-2 p-1 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-sm">
                    <ModeToggle />
                    {!loading && (
                        user ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="rounded-full">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    )
}
