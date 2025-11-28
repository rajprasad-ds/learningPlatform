'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{
                    opacity: 0,
                    filter: 'blur(10px)',
                    clipPath: 'circle(0% at 0% 0%)'
                }}
                animate={{
                    opacity: 1,
                    filter: 'blur(0px)',
                    clipPath: 'circle(150% at 0% 0%)'
                }}
                exit={{
                    opacity: 0,
                    filter: 'blur(10px)',
                    clipPath: 'circle(0% at 0% 0%)'
                }}
                transition={{
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
