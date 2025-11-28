import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Loading() {
    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-background flex items-center justify-center">
            <LoadingSpinner text="Loading lesson..." />
        </div>
    )
}
