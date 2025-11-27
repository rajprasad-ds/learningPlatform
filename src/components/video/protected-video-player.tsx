'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2, AlertCircle } from 'lucide-react'
import { DynamicWatermark } from './dynamic-watermark'
import { Button } from '@/components/ui/button'

interface ProtectedVideoPlayerProps {
    videoUrl: string
    userEmail: string
    userId: string
    sessionId: string
    ipAddress?: string
    onProgress?: (progress: number) => void
    onComplete?: () => void
}

export function ProtectedVideoPlayer({
    videoUrl,
    userEmail,
    userId,
    sessionId,
    ipAddress,
    onProgress,
    onComplete,
}: ProtectedVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    if (!ctx) return

    let animationId: number

    const drawFrame = () => {
        if (video.paused || video.ended) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 3; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() * 2 - 1)))
        }

        ctx.putImageData(imageData, 0, 0)
        animationId = requestAnimationFrame(drawFrame)
    }

    video.addEventListener('play', drawFrame)

    return () => {
        video.removeEventListener('play', drawFrame)
        cancelAnimationFrame(animationId)
    }
}, [])

const handlePlayPause = () => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }
}

const handleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }
}

const handleFullscreen = () => {
    if (containerRef.current) {
        if (!isFullscreen) {
            containerRef.current.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
        setIsFullscreen(!isFullscreen)
    }
}

const handleTimeUpdate = () => {
    if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)

        if (onProgress && duration > 0) {
            const progress = (videoRef.current.currentTime / duration) * 100
            onProgress(progress)
        }

        if (duration > 0 && videoRef.current.currentTime / duration > 0.95) {
            onComplete?.()
        }
    }
}

const handleLoadedMetadata = () => {
    if (videoRef.current) {
        setDuration(videoRef.current.duration)
        setIsLoading(false)
    }
}

const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
        const time = parseFloat(e.target.value)
        videoRef.current.currentTime = time
        setCurrentTime(time)
    }
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

return (
    <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
    >
        <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
        />

        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-contain"
        />

        <DynamicWatermark
            userEmail={userEmail}
            userId={userId}
            sessionId={sessionId}
            ipAddress={ipAddress}
        />

        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
        )}

        <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
            <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 mb-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                }}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePlayPause}
                        className="text-white hover:text-purple-400 transition-colors"
                    >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={handleMute}
                        className="text-white hover:text-purple-400 transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>

                    <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="text-white hover:text-purple-400 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleFullscreen}
                        className="text-white hover:text-purple-400 transition-colors"
                    >
                        <Maximize className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
)
}
