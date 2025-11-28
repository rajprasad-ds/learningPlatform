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
    const hlsRef = useRef<any>(null) // Store HLS instance
    const shouldResumeRef = useRef(false) // Track if we should auto-resume after buffering
    const bufferCheckInterval = useRef<NodeJS.Timeout | null>(null)
    const bufferTimeout = useRef<NodeJS.Timeout | null>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [buffered, setBuffered] = useState(0)
    const [isHoveringSpeed, setIsHoveringSpeed] = useState(false)

    const [qualities, setQualities] = useState<{ height: number; level: number }[]>([])
    const [currentQuality, setCurrentQuality] = useState<number>(-1) // -1 = Auto
    const [isHoveringQuality, setIsHoveringQuality] = useState(false)
    const [hasCanvasError, setHasCanvasError] = useState(false)

    // Update buffered state
    const handleProgress = () => {
        if (videoRef.current && duration > 0) {
            const video = videoRef.current
            const current = video.currentTime
            let bufferEnd = 0

            // Find the buffered range that contains the current time
            for (let i = 0; i < video.buffered.length; i++) {
                if (video.buffered.start(i) <= current + 0.5 && video.buffered.end(i) >= current) {
                    bufferEnd = video.buffered.end(i)
                    break
                }
            }
            setBuffered(bufferEnd)
        }
    }

    // Buffer Health Check Logic
    const checkBufferHealth = () => {
        const video = videoRef.current
        if (!video) return

        const current = video.currentTime
        const duration = video.duration
        if (!duration) return

        // Find buffer range covering current time
        let bufferEnd = 0
        for (let i = 0; i < video.buffered.length; i++) {
            if (video.buffered.start(i) <= current + 0.5 && video.buffered.end(i) >= current) {
                bufferEnd = video.buffered.end(i)
                break
            }
        }

        const bufferedAhead = bufferEnd - current
        const isNearEnd = duration - current < 5
        const targetBuffer = isNearEnd ? (duration - current) : 10 // Target 10s of buffer

        // If we have enough buffer, or we are at the end
        if (bufferedAhead >= targetBuffer || (isNearEnd && bufferedAhead > 0.5)) {
            setIsLoading(false)
            if (shouldResumeRef.current) {
                video.play().catch(() => { })
                setIsPlaying(true)
            }
            if (bufferCheckInterval.current) {
                clearInterval(bufferCheckInterval.current)
                bufferCheckInterval.current = null
            }
            if (bufferTimeout.current) {
                clearTimeout(bufferTimeout.current)
                bufferTimeout.current = null
            }
        }
    }

    const startBufferCheck = () => {
        if (bufferCheckInterval.current) clearInterval(bufferCheckInterval.current)
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current)

        setIsLoading(true)
        // Check every 500ms
        bufferCheckInterval.current = setInterval(checkBufferHealth, 500)

        // Safety timeout: Force resume after 15s if stuck
        bufferTimeout.current = setTimeout(() => {
            setIsLoading(false)
            if (bufferCheckInterval.current) {
                clearInterval(bufferCheckInterval.current)
                bufferCheckInterval.current = null
            }
        }, 15000)
    }

    // Initialize HLS.js for m3u8 playback
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (videoUrl.includes('.m3u8')) {
            import('hls.js').then(({ default: Hls }) => {
                if (Hls.isSupported()) {
                    const hls = new Hls({
                        capLevelToPlayerSize: true, // Smart initial quality
                        autoStartLoad: true,
                        maxBufferLength: 30, // Increase buffer to 30s (default is 30s, but explicit is good)
                        maxMaxBufferLength: 60, // Max buffer size in seconds
                        backBufferLength: 90, // Keep 90s of back buffer
                    })
                    hlsRef.current = hls
                    hls.loadSource(videoUrl)
                    hls.attachMedia(video)

                    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                        setIsLoading(false)
                        // Extract available qualities
                        const availableQualities = data.levels.map((level: any, index: number) => ({
                            height: level.height,
                            level: index
                        })).sort((a: any, b: any) => b.height - a.height) // Sort high to low

                        setQualities(availableQualities)
                    })

                    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                        // Optional: Update UI to show current auto-selected level if needed
                        // But we usually just show "Auto" unless manually overridden
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

    // Canvas rendering with error handling
    useEffect(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || hasCanvasError) return

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        let animationId: number

        const drawFrame = () => {
            if (video.ended) return

            // Safety check: ensure video has valid dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                animationId = requestAnimationFrame(drawFrame)
                return
            }

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                if (!video.paused) {
                    animationId = requestAnimationFrame(drawFrame)
                }
            } catch (error) {
                console.error("Canvas rendering error (likely CORS):", error)
                setHasCanvasError(true) // Fallback to direct video
                cancelAnimationFrame(animationId)
            }
        }

        const renderFrame = () => {
            drawFrame()
        }

        video.addEventListener('play', drawFrame)
        video.addEventListener('loadeddata', renderFrame)
        video.addEventListener('seeked', renderFrame)

        // Smart Buffering Handlers
        const handleWaiting = () => {
            setIsLoading(true)
            shouldResumeRef.current = isPlaying // Remember if we were playing
            startBufferCheck()
        }

        const handlePlaying = () => {
            // We don't auto-clear loading here anymore, checkBufferHealth handles it
            // unless it's a normal play event not related to buffering
            if (!bufferCheckInterval.current) setIsLoading(false)
            drawFrame() // Ensure loop starts
        }

        video.addEventListener('waiting', handleWaiting)
        video.addEventListener('playing', handlePlaying)

        return () => {
            video.removeEventListener('play', drawFrame)
            video.removeEventListener('loadeddata', renderFrame)
            video.removeEventListener('seeked', renderFrame)
            video.removeEventListener('waiting', handleWaiting)
            video.removeEventListener('playing', handlePlaying)
            cancelAnimationFrame(animationId)
            if (bufferCheckInterval.current) clearInterval(bufferCheckInterval.current)
        }
    }, [isPlaying, hasCanvasError])

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
                shouldResumeRef.current = false
            } else {
                videoRef.current.play()
                shouldResumeRef.current = true
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

            // Check if we have enough buffer at the new time
            let isBuffered = false
            for (let i = 0; i < videoRef.current.buffered.length; i++) {
                // Check if target time is within a buffered range (with 2s safety margin)
                if (videoRef.current.buffered.start(i) <= time && videoRef.current.buffered.end(i) >= time + 2) {
                    isBuffered = true
                    break
                }
            }

            // Only trigger buffering if we don't have enough data
            if (!isBuffered) {
                shouldResumeRef.current = isPlaying
                videoRef.current.pause()
                startBufferCheck()
            }
        }
    }

    const handleSpeedChange = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate
            setPlaybackRate(rate)
        }
    }

    const handleQualityChange = (level: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = level
            setCurrentQuality(level)

            // Trigger smart buffering on quality change
            shouldResumeRef.current = isPlaying
            if (videoRef.current) videoRef.current.pause()
            startBufferCheck()
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
                className={`absolute inset-0 w-full h-full object-contain ${hasCanvasError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onProgress={handleProgress}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-contain ${hasCanvasError ? 'hidden' : 'block'}`}
                onClick={handlePlayPause}
            />

            <DynamicWatermark
                userEmail={userEmail}
                userId={userId}
                sessionId={sessionId}
                ipAddress={ipAddress}
            />

            {
                isLoading && (
                    <>
                        {/* Black Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20" />

                        {/* Rainbow Loading Border - 4 Bar Approach */}
                        <div className="absolute inset-0 z-50 pointer-events-none rounded-lg overflow-hidden">
                            {/* Top Bar */}
                            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#4285f4] via-[#34a853] via-[#fbbc05] via-[#ea4335] to-[#4285f4] bg-[length:200%_100%] animate-shimmer" />
                            {/* Bottom Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#4285f4] via-[#34a853] via-[#fbbc05] via-[#ea4335] to-[#4285f4] bg-[length:200%_100%] animate-shimmer" />
                            {/* Left Bar */}
                            <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-[#4285f4] via-[#34a853] via-[#fbbc05] via-[#ea4335] to-[#4285f4] bg-[length:100%_200%] animate-shimmer" />
                            {/* Right Bar */}
                            <div className="absolute top-0 bottom-0 right-0 w-[4px] bg-gradient-to-b from-[#4285f4] via-[#34a853] via-[#fbbc05] via-[#ea4335] to-[#4285f4] bg-[length:100%_200%] animate-shimmer" />
                        </div>
                    </>
                )
            }

            {/* Play/Pause Overlay Animation */}
            {
                !isPlaying && !isLoading && (
                    <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        onClick={handlePlayPause}
                    >
                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>
                )
            }

            {/* Controls Container */}
            <div
                className={`
                    absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 z-30
                    ${showControls && !isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                `}
            >
                {/* Frosted Glass Bar */}
                <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 shadow-xl">

                    {/* Progress Bar */}
                    <div className="relative w-full h-1 group/slider mb-4 cursor-pointer">
                        {/* Background Track */}
                        <div className="absolute inset-0 bg-white/20 rounded-full"></div>

                        {/* Buffered Bar */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/40 rounded-full transition-all duration-300"
                            style={{ width: `${(buffered / duration) * 100}%` }}
                        ></div>

                        {/* Playhead Bar */}
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

                            {/* Quality Controller */}
                            {qualities.length > 0 && (
                                <div
                                    className="relative group/quality"
                                    onMouseEnter={() => setIsHoveringQuality(true)}
                                    onMouseLeave={() => setIsHoveringQuality(false)}
                                >
                                    <div className={`
                                        flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 
                                        backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden
                                        ${isHoveringQuality ? 'w-auto bg-black/80' : 'w-16 hover:bg-white/20'}
                                    `}>
                                        <Settings className="w-3 h-3 text-white/80 flex-shrink-0" />

                                        {isHoveringQuality ? (
                                            <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleQualityChange(-1)
                                                    }}
                                                    className={`
                                                        text-xs font-bold px-1.5 py-0.5 rounded transition-colors whitespace-nowrap
                                                        ${currentQuality === -1
                                                            ? 'text-purple-400 bg-purple-500/10'
                                                            : 'text-white/60 hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    Auto
                                                </button>
                                                {qualities.map((q) => (
                                                    <button
                                                        key={q.level}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleQualityChange(q.level)
                                                        }}
                                                        className={`
                                                            text-xs font-bold px-1.5 py-0.5 rounded transition-colors whitespace-nowrap
                                                            ${currentQuality === q.level
                                                                ? 'text-purple-400 bg-purple-500/10'
                                                                : 'text-white/60 hover:text-white'
                                                            }
                                                        `}
                                                    >
                                                        {q.height}p
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-white ml-1">
                                                {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.level === currentQuality)?.height}p`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Speed Controller */}
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
        </div >
    )
}
