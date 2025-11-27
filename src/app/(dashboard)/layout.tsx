'use client'

import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen pt-20 px-4 pb-4 overflow-hidden">
            {/* Dashboard Container - Rounded with margins, fits viewport */}
            <div className="h-full container mx-auto">
                <div className="h-full bg-white dark:bg-black backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <DashboardSidebar />

                        {/* Main Content - Scrollable */}
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}
