'use client'

import { useLoadingStore } from '@/store/loading-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'

export function GlobalOverlay() {
    const { isLoading, message, error, setLoading, setError } = useLoadingStore()
    const pathname = usePathname()

    // Auto-hide loading when route changes
    useEffect(() => {
        // Small delay to let the page transition start
        const timer = setTimeout(() => {
            setLoading(false)
            setError(null)
        }, 300)

        return () => clearTimeout(timer)
    }, [pathname, setLoading, setError])

    if (!isLoading && !error) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full mx-4 relative">

                {/* Close button for errors */}
                {error && (
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}

                {error ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Error</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                ) : (
                    <LoadingSpinner text={message} />
                )}
            </div>
        </div>
    )
}
