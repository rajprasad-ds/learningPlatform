'use client'

import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const mainRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      main.classList.add('scrolling')
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        main.classList.remove('scrolling')
      }, 1000)
    }

    main.addEventListener('scroll', handleScroll)
    return () => {
      main.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <div className="h-screen pt-20 px-4 pb-4 overflow-hidden bg-gray-50 dark:bg-transparent">
      <div className="h-full container mx-auto">
        <div className="h-full bg-white dark:bg-black backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
          <div className="flex h-full">
            <DashboardSidebar />

            <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar">
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
                    clipPath: 'circle(300% at 0% 0%)'
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
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 10px;
          background-clip: padding-box;
          border: 2px solid transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover,
        .custom-scrollbar.scrolling::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.8);
          background-clip: padding-box;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 51, 234, 0.3) transparent;
        }
        
        .custom-scrollbar.scrolling {
          scrollbar-color: rgba(147, 51, 234, 0.8) transparent;
        }
      `}</style>
    </div>
  )
}
