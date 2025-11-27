'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
    const pathname = usePathname()
    const [hoveredPath, setHoveredPath] = useState<string | null>(null)

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Explore Problems', path: '/explore-problems' },
        { name: 'Challenges', path: '/challenges' },
        { name: 'Resources', path: '/resources' },
        { name: 'Community', path: '/community' },
    ]

    return (
        <nav className="fixed top-0 w-full z-50 pt-4 px-4 transition-all duration-300">
            <div className="container mx-auto relative flex items-center justify-center h-14">

                {/* 1. Logo Island (Absolute Left) */}
                <div className="absolute left-0 flex items-center gap-2 p-1.5 pl-3 pr-4 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-sm">
                    <Link href="/" className="flex items-center gap-2 group">
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
                                    "relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200",
                                    isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                                )}
                                onMouseEnter={() => setHoveredPath(item.path)}
                                onMouseLeave={() => setHoveredPath(null)}
                            >
                                {/* Active State Slider (Purple Background + Glow) */}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active-tab"
                                        className="absolute inset-0 bg-purple-600 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.6)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {/* Hover State (Subtle Gray) - Only if not active */}
                                {!isActive && hoveredPath === item.path && (
                                    <motion.div
                                        layoutId="navbar-hover-tab"
                                        className="absolute inset-0 bg-white/10 rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}

                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* 3. Actions Island (Absolute Right) */}
                <div className="absolute right-0 flex items-center gap-2 p-1.5 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-sm">
                    <ModeToggle />

                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </nav>
    )
}
