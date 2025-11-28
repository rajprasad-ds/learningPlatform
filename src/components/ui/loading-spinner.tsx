import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    className?: string
    size?: number
    text?: string
}

export function LoadingSpinner({ className = "", size = 32, text }: LoadingSpinnerProps) {
    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <Loader2
                className="animate-spin text-purple-600"
                size={size}
            />
            {text && (
                <p className="text-lg font-medium text-gray-900 dark:text-white animate-pulse">
                    {text}
                </p>
            )}
        </div>
    )
}
