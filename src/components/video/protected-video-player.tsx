'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaPlayer, MediaProvider, Track } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'

import { DynamicWatermark } from './dynamic-watermark'

interface ProtectedVideoPlayerProps {
    videoUrl: string
    userEmail: string
    userId: string
    sessionId: string
    ipAddress?: string
    chaptersUrl?: string
    onProgress?: (progress: number) => void
    onComplete?: () => void
}

export function ProtectedVideoPlayer({
    videoUrl,
    userEmail,
    userId,
    sessionId,
    ipAddress,
    chaptersUrl,
    onProgress,
    onComplete,
}: ProtectedVideoPlayerProps) {
    const playerRef = useRef<any>(null)

    // Handle progress updates
    const onTimeUpdate = (detail: any) => {
        if (onProgress && detail.currentTime && detail.duration) {
            const progress = (detail.currentTime / detail.duration) * 100
            onProgress(progress)
        }
    }

    // Handle completion
    const onEnded = () => {
        onComplete?.()
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
            <MediaPlayer
                src={videoUrl}
                viewType="video"
                streamType="on-demand"
                logLevel="warn"
                crossOrigin
                playsInline
                title="Course Video"
                className="w-full h-full"
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                ref={playerRef}
            >
                <MediaProvider>
                    {chaptersUrl && (
                        <Track
                            src={chaptersUrl}
                            kind="chapters"
                            lang="en-US"
                            label="Chapters"
                            default
                        />
                    )}
                </MediaProvider>

                {/* Default Layout with Icons */}
                <DefaultVideoLayout
                    icons={defaultLayoutIcons}
                    thumbnails={null} // Add thumbnails if available later
                />

                {/* Custom Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
                    <DynamicWatermark
                        userEmail={userEmail}
                        userId={userId}
                        sessionId={sessionId}
                        ipAddress={ipAddress}
                    />
                </div>
            </MediaPlayer>

            {/* Custom CSS Variables for Theme */}
            <style jsx global>{`
                media-player {
                    --media-brand: #9333ea; /* Purple-600 */
                    --media-focus-ring: 0 0 0 3px rgba(147, 51, 234, 0.5);
                }
            `}</style>
        </div>
    )
}
