import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Loading() {
    return (
        <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner text="Loading your courses..." />
        </div>
    )
}
