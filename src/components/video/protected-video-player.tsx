'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings, Loader2, Camera, FastForward, ChevronRight
} from 'lucide-react'
import { DynamicWatermark } from './dynamic-watermark'

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
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isHoveringSpeed, setIsHoveringSpeed] = useState(false)

    // Initialize HLS.js for m3u8 playback
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (videoUrl.includes('.m3u8')) {
            import('hls.js').then(({ default: Hls }) => {
                if (Hls.isSupported()) {
                    const hls = new Hls()
                    hls.loadSource(videoUrl)
                    hls.attachMedia(video)
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        setIsLoading(false)
                    })
                    return () => {
                        hls.destroy()
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl
                    setIsLoading(false)
                }
            })
        } else {
            video.src = videoUrl
        }
    }, [videoUrl])

    // Canvas poisoning with safety checks
    useEffect(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        let animationId: number

        const drawFrame = () => {
            if (video.paused || video.ended) return

            // Safety check: ensure video has valid dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                animationId = requestAnimationFrame(drawFrame)
                return
            }

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
            const newMuted = !isMuted
            videoRef.current.muted = newMuted
            setIsMuted(newMuted)
            if (newMuted) {
                setVolume(0)
            } else {
                setVolume(1)
                videoRef.current.volume = 1
            }
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
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

    const handleSpeedChange = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate
            setPlaybackRate(rate)
        }
    }

    const handleScreenshot = () => {
        if (canvasRef.current) {
            const link = document.createElement('a')
            link.download = `screenshot-${Date.now()}.png`
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
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
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="hidden"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain"
                onClick={handlePlayPause}
            />

            <DynamicWatermark
                userEmail={userEmail}
                userId={userId}
                sessionId={sessionId}
                ipAddress={ipAddress}
            />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                </div>
            )}

            {/* Play/Pause Overlay Animation */}
            {!isPlaying && !isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    onClick={handlePlayPause}
                >
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Container */}
            <div
                className={`
                    absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 z-30
                    ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
            >
                {/* Frosted Glass Bar */}
                <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 shadow-xl">

                    {/* Progress Bar */}
                    <div className="relative w-full h-1 group/slider mb-4 cursor-pointer">
                        <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                        <div
                            className="absolute inset-y-0 left-0 bg-purple-600 rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Left Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePlayPause}
                                className="text-white hover:text-purple-400 transition-colors"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                            </button>

                            <div className="flex items-center gap-2 group/volume">
                                <button
                                    onClick={handleMute}
                                    className="text-white hover:text-purple-400 transition-colors"
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            </div>

                            <span className="text-white/80 text-xs font-medium font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">

                            {/* Speed Controller: Interactive Glass Pill */}
                            <div
                                className="relative group/speed"
                                onMouseEnter={() => setIsHoveringSpeed(true)}
                                onMouseLeave={() => setIsHoveringSpeed(false)}
                            >
                                <div className={`
                                    flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 
                                    backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden
                                    ${isHoveringSpeed ? 'w-48 bg-black/80' : 'w-16 hover:bg-white/20'}
                                `}>
                                    <FastForward className="w-3 h-3 text-white/80 flex-shrink-0" />

                                    {isHoveringSpeed ? (
                                        <div className="flex items-center justify-between w-full ml-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                            {[0.5, 1, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleSpeedChange(rate)
                                                    }}
                                                    className={`
                                                        text-xs font-bold px-1.5 py-0.5 rounded transition-colors
                                                        ${playbackRate === rate
                                                            ? 'text-purple-400 bg-purple-500/10'
                                                            : 'text-white/60 hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-white ml-1">{playbackRate}x</span>
                                    )}
                                </div>
                            </div>

                            {/* Screenshot Tool */}
                            <button
                                onClick={handleScreenshot}
                                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors group/shot relative"
                                title="Take Screenshot"
                            >
                                <Camera className="w-5 h-5" />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/shot:opacity-100 transition-opacity whitespace-nowrap">
                                    Screenshot
                                </span>
                            </button>

                            <div className="w-px h-4 bg-white/10 mx-1"></div>

                            <button
                                onClick={handleFullscreen}
                                className="text-white hover:text-purple-400 transition-colors"
                            >
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
