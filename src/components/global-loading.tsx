'use client'

import { useLoadingStore } from '@/store/loading-store'
import { Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function GlobalLoading() {
    const { isLoading, message } = useLoadingStore()
    const pathname = usePathname()

    // Auto-hide loading when route changes
    useEffect(() => {
        const setLoading = useLoadingStore.getState().setLoading
        // Small delay to let the page transition start
        const timer = setTimeout(() => {
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [pathname])

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    )
}
