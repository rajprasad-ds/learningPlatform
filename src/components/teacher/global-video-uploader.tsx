'use client'

import { useUploadStore } from '@/stores/upload-store'
import { X, CheckCircle, AlertCircle, Ban, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function GlobalVideoUploader() {
    const {
        isUploading,
        progress,
        status,
        error,
        cancelUpload,
        reset,
        originPath
    } = useUploadStore()

    const router = useRouter()
    const pathname = usePathname()
    const [showConfirm, setShowConfirm] = useState(false)

    // Auto-refresh page on success to show new video
    useEffect(() => {
        if (status === 'success') {
            router.refresh()
        }
    }, [status, router])

    // Auto-hide after cancellation
    useEffect(() => {
        if (status === 'cancelled') {
            const timer = setTimeout(() => {
                reset()
            }, 3000) // Show "Cancelled" for 3 seconds
            return () => clearTimeout(timer)
        }
    }, [status, reset])

    // Hide if we are on the original upload page (local uploader handles it)
    if (pathname === originPath && status === 'uploading') return null

    if (status === 'idle') return null

    // Circular Progress Component
    const radius = 10
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed top-24 right-6 z-50 cursor-grab active:cursor-grabbing"
            >
                <div className={cn(
                    "flex items-center gap-3 pl-3 pr-2 py-2 rounded-full shadow-2xl border backdrop-blur-md transition-all",
                    "bg-white/90 dark:bg-zinc-900/90 border-gray-200/50 dark:border-white/10",
                    status === 'error' ? "border-red-500/20 bg-red-50/90 dark:bg-red-900/90" : "",
                    status === 'cancelled' ? "border-orange-500/20 bg-orange-50/90 dark:bg-orange-900/90" : ""
                )}>

                    {/* Status Icon / Progress */}
                    <div className="relative flex items-center justify-center w-8 h-8 pointer-events-none">
                        {status === 'uploading' && (
                            <>
                                {/* Background Circle */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-gray-200 dark:text-zinc-700"
                                    />
                                    {/* Progress Circle */}
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="text-purple-600 transition-all duration-300 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-[8px] font-bold text-purple-600 dark:text-purple-400">
                                    {progress}
                                </span>
                            </>
                        )}
                        {status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {status === 'cancelled' && <Ban className="w-5 h-5 text-orange-500" />}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col justify-center mr-2 pointer-events-none">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                            {showConfirm ? 'Cancel Upload?' :
                                status === 'uploading' ? 'Uploading...' :
                                    status === 'success' ? 'Complete' :
                                        status === 'cancelled' ? 'Cancelled' : 'Failed'}
                        </span>
                        {!showConfirm && status === 'uploading' && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                                {progress}%
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    {showConfirm ? (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    cancelUpload()
                                    setShowConfirm(false)
                                }}
                                className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowConfirm(false)
                                }}
                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation() // Prevent drag start
                                if (status === 'uploading') {
                                    setShowConfirm(true)
                                } else {
                                    reset()
                                }
                            }}
                            className={cn(
                                "p-1.5 rounded-full transition-colors",
                                "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400",
                                status === 'error' && "hover:bg-red-200/50 text-red-600",
                                status === 'cancelled' && "hover:bg-orange-200/50 text-orange-600"
                            )}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
