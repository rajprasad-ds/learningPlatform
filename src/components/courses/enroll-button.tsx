'use client'

import { useState } from 'react'
import { purchaseCourse } from '@/actions/course-actions'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EnrollButtonProps {
    courseId: string
    price: number
}

export function EnrollButton({ courseId, price }: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleEnroll() {
        setIsLoading(true)
        try {
            const result = await purchaseCourse(courseId)
            if (result.success) {
                router.refresh()
            } else {
                alert('Enrollment failed. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('Enrollment failed.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                </>
            ) : (
                'Enroll Now'
            )}
        </button>
    )
}
