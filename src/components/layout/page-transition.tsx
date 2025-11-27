'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

const routes = ['/', '/courses', '/explore-problems', '/challenges', '/resources', '/community', '/login', '/signup']

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
}

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const prevPathname = useRef(pathname)

    // Calculate direction
    // 1 = Forward (Right to Left)
    // -1 = Backward (Left to Right)
    const currentIdx = routes.indexOf(pathname)
    const prevIdx = routes.indexOf(prevPathname.current)

    // Default to forward if route not found
    let direction = 1
    if (currentIdx !== -1 && prevIdx !== -1) {
        direction = currentIdx > prevIdx ? 1 : -1
    }

    // Update ref for next render
    if (pathname !== prevPathname.current) {
        prevPathname.current = pathname
    }

    return (
        <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
                key={pathname}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
