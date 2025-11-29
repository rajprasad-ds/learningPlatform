'use client'
//this will be a backup
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import {
    MediaPlayer,
    MediaProvider,
    Track,
    Controls,
    TimeSlider,
    VolumeSlider,
    Gesture,
    useMediaState,
    useMediaRemote,
    useVideoQualityOptions,
    usePlaybackRateOptions,
    type MediaPlayerInstance,
    type VideoQuality,
    type PlaybackRateOption
} from '@vidstack/react'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings, Camera, FastForward
} from 'lucide-react'
import '@vidstack/react/player/styles/base.css'

import { DynamicWatermark } from './dynamic-watermark'

interface ProtectedVideoPlayerProps {
    videoUrl: string
    userEmail: string
    userId: string
    sessionId: string
    ipAddress?: string
    chaptersUrl?: string
    onTimeUpdate?: (time: number) => void
    onProgress?: (progress: number) => void
    onComplete?: () => void
}

export interface ProtectedVideoPlayerRef {
    seekTo: (time: number) => void
}

export const ProtectedVideoPlayer = forwardRef<ProtectedVideoPlayerRef, ProtectedVideoPlayerProps>(({
    videoUrl,
    userEmail,
    userId,
    sessionId,
    ipAddress,
    chaptersUrl,
    onTimeUpdate: onTimeUpdateProp,
    onProgress,
    onComplete,
}, ref) => {
    const playerRef = useRef<MediaPlayerInstance>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const remote = useMediaRemote(playerRef)
    const duration = useMediaState('duration', playerRef)

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (playerRef.current) {
                playerRef.current.currentTime = time
                // Optional: Auto-play if paused
                remote.play()
            }
        }
    }))

    // ... rest of component


    // Handle progress updates
    const onTimeUpdate = (detail: any) => {
        const time = detail.currentTime
        const duration = detail.duration

        // console.log('Video Time Update:', time, duration) // Debug log

        // Call time update prop (seconds)
        if (onTimeUpdateProp) {
            onTimeUpdateProp(time)
        }

        // Call progress prop (percentage)
        if (onProgress && time && duration) {
            const progress = (time / duration) * 100
            if (Number.isFinite(progress)) {
                onProgress(progress)
            }
        }
    }





    // Handle completion
    const onEnded = () => {
        onComplete?.()
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group select-none"
        >
            <MediaPlayer
                src={videoUrl}
                viewType="video"
                streamType="on-demand"
                logLevel="warn"
                crossOrigin="anonymous"
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

                <Gesture
                    className="absolute inset-0 z-0 block h-full w-full"
                    event="pointerup"
                    action="toggle:paused"
                />
                <Gesture
                    className="absolute inset-0 z-0 block h-full w-full"
                    event="dblpointerup"
                    action="toggle:fullscreen"
                />

                {/* Custom Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none z-[50] overflow-hidden">
                    <DynamicWatermark
                        userEmail={userEmail}
                        userId={userId}
                        sessionId={sessionId}
                        ipAddress={ipAddress}
                    />
                </div>

                {/* Custom Controls Layout */}
                <Controls.Root className="absolute inset-0 z-[60] flex flex-col justify-between opacity-0 transition-opacity duration-300 data-[visible]:opacity-100">

                    {/* Top Group (Optional: Title or Back button could go here) */}
                    <Controls.Group className="w-full p-4 bg-gradient-to-b from-black/60 to-transparent">
                    </Controls.Group>

                    {/* Center Group (Play/Pause Overlay) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <PlayPauseOverlay />
                    </div>

                    {/* Bottom Group (Main Controls) */}
                    <Controls.Group className="w-full p-4 mt-auto">
                        <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 shadow-xl">

                            <TimeSlider.Root
                                className="relative w-full h-5 group/slider mb-2 flex items-center cursor-pointer select-none touch-none"
                            >
                                <TimeSlider.Track className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                    <TimeSlider.TrackFill className="absolute top-0 left-0 h-full bg-purple-600 rounded-full z-20 w-[var(--slider-fill)] will-change-[width]" />
                                    <TimeSlider.Progress className="absolute top-0 left-0 h-full bg-white/50 rounded-full z-10 w-[var(--slider-progress)] will-change-[width]" />
                                </TimeSlider.Track>

                                <TimeSlider.Chapters className="absolute inset-0 w-full h-full z-20">
                                    {(cues, forwardRef) =>
                                        cues.map((cue) => (
                                            <div
                                                className="absolute top-0 h-full w-1 bg-black/50 hover:bg-black z-30 flex flex-col items-center justify-start group/chapter"
                                                style={{ left: `${(cue.startTime / duration) * 100}%` }}
                                                key={cue.startTime}
                                                ref={forwardRef}
                                            >
                                                <div className="opacity-0 group-hover/chapter:opacity-100 absolute bottom-full mb-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity">
                                                    {cue.text}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </TimeSlider.Chapters>

                                <TimeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity z-30 ring-2 ring-purple-500 left-[var(--slider-fill)] will-change-[left]" />
                            </TimeSlider.Root>

                            <div className="flex items-center justify-between">
                                {/* Left Controls */}
                                <div className="flex items-center gap-4">
                                    <PlayPauseButton />
                                    <VolumeControl />
                                    <TimeDisplay />
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-3">
                                    <QualityController />
                                    <SpeedController />
                                    <ScreenshotButton containerRef={containerRef} />
                                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                                    <FullscreenButton />
                                </div>
                            </div>
                        </div>
                    </Controls.Group>
                </Controls.Root>
            </MediaPlayer >
        </div >
    )
})

ProtectedVideoPlayer.displayName = 'ProtectedVideoPlayer'

// --- Sub-Components ---



function PlayPauseOverlay() {
    const isPaused = useMediaState('paused')
    const canPlay = useMediaState('canPlay')

    if (!isPaused || !canPlay) return null

    return (
        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
    )
}

function PlayPauseButton() {
    const isPaused = useMediaState('paused')
    const remote = useMediaRemote()

    return (
        <button
            onClick={() => isPaused ? remote.play() : remote.pause()}
            className="text-white hover:text-purple-400 transition-colors"
        >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
        </button>
    )
}

function VolumeControl() {
    const volume = useMediaState('volume')
    const isMuted = useMediaState('muted')
    const remote = useMediaRemote()

    return (
        <div className="flex items-center gap-2 group/volume">
            <button
                onClick={() => isMuted ? remote.unmute() : remote.mute()}
                className="text-white hover:text-purple-400 transition-colors"
            >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <VolumeSlider.Root className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 relative h-5 flex items-center">
                <VolumeSlider.Track className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <VolumeSlider.TrackFill className="absolute top-0 left-0 h-full bg-purple-500 rounded-full" />
                </VolumeSlider.Track>
                <VolumeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover/volume:opacity-100" />
            </VolumeSlider.Root>
        </div>
    )
}

function TimeDisplay() {
    const currentTime = useMediaState('currentTime')
    const duration = useMediaState('duration')

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <span className="text-white/80 text-xs font-medium font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
        </span>
    )
}

function QualityController() {
    const options = useVideoQualityOptions()
    const currentQuality = options.selectedQuality?.height ? `${options.selectedQuality.height}p` : 'Auto'
    const [isHovering, setIsHovering] = useState(false)

    if (options.length <= 1) return null

    return (
        <div
            className="relative group/quality"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 
                backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden
                ${isHovering ? 'w-auto bg-black/80' : 'w-16 hover:bg-white/20'}
            `}>
                <Settings className="w-3 h-3 text-white/80 flex-shrink-0" />

                {isHovering ? (
                    <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Pass the event to select() to ensure context if needed
                                    option.select(e.nativeEvent)
                                }}
                                className={`
                                    text-xs font-bold px-1.5 py-0.5 rounded transition-colors whitespace-nowrap
                                    ${option.selected
                                        ? 'text-purple-400 bg-purple-500/10'
                                        : 'text-white/60 hover:text-white'
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs font-bold text-white ml-1">
                        {currentQuality}
                    </span>
                )}
            </div>
        </div>
    )
}

function SpeedController() {
    const options = usePlaybackRateOptions({ rates: [0.5, 1, 1.5, 2] })
    const currentRate = options.selectedValue
    const [isHovering, setIsHovering] = useState(false)

    return (
        <div
            className="relative group/speed"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 
                backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden
                ${isHovering ? 'w-48 bg-black/80' : 'w-16 hover:bg-white/20'}
            `}>
                <FastForward className="w-3 h-3 text-white/80 flex-shrink-0" />

                {isHovering ? (
                    <div className="flex items-center justify-between w-full ml-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        {options.map((rate) => (
                            <button
                                key={rate.value}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    rate.select(e.nativeEvent)
                                }}
                                className={`
                                    text-xs font-bold px-1.5 py-0.5 rounded transition-colors
                                    ${currentRate === rate.value
                                        ? 'text-purple-400 bg-purple-500/10'
                                        : 'text-white/60 hover:text-white'
                                    }
                                `}
                            >
                                {rate.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs font-bold text-white ml-1">{currentRate}x</span>
                )}
            </div>
        </div>
    )
}

function ScreenshotButton({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
    const handleScreenshot = () => {
        const video = containerRef.current?.querySelector('video')
        if (!video) return

        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const link = document.createElement('a')
        link.download = `screenshot-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    return (
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
    )
}

function FullscreenButton() {
    const isFullscreen = useMediaState('fullscreen')
    const remote = useMediaRemote()

    return (
        <button
            onClick={() => isFullscreen ? remote.exitFullscreen() : remote.enterFullscreen()}
            className="text-white hover:text-purple-400 transition-colors"
        >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
    )
}
