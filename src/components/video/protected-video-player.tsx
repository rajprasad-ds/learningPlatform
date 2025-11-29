'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import {
    MediaPlayer,
    MediaProvider,
    Track,
    Controls,
    TimeSlider,
    VolumeSlider,
    useMediaState,
    useMediaRemote,
    useVideoQualityOptions,
    usePlaybackRateOptions,
    type MediaPlayerInstance
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
    const playerRef = useRef<MediaPlayerInstance | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const remote = useMediaRemote(playerRef)
    const duration = useMediaState('duration', playerRef)
    const textTracks = useMediaState('textTracks', playerRef)

    // Hover-scrub state & refs
    const hoverRef = useRef<{
        originalTime: number,
        wasPlaying: boolean,
        isHovering: boolean
    }>({
        originalTime: 0,
        wasPlaying: false,
        isHovering: false
    })
    const [hoverTime, setHoverTime] = useState<number | null>(null)
    const [hoverPct, setHoverPct] = useState<number>(0) // 0-100
    const [chaptersCues, setChaptersCues] = useState<any[]>([])

    // throttle/RAF handle
    const rafRef = useRef<number | null>(null)

    // prevent emitting progress while hover-scrubbing
    const isHovering = useRef(false)

    // ----------------------
    // Imperative API
    // ----------------------
    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (playerRef.current) {
                playerRef.current.currentTime = time
                remote.play()
            }
        }
    }))

    // ----------------------
    // Parse chapters from text tracks (VTT)
    // ----------------------
    useEffect(() => {
        if (!textTracks) return

        const chaptersTrack = textTracks.find((t: any) => t.kind === 'chapters')
        if (chaptersTrack) {
            const updateCues = () => {
                const loadedCues = Array.from(chaptersTrack.cues || []).map((c: any) => ({
                    startTime: c.startTime,
                    endTime: (c as any).endTime ?? (c as any).end ?? null,
                    text: c.text
                }))

                const withEnds = loadedCues.map((c, idx) => ({
                    ...c,
                    endTime: c.endTime ?? (loadedCues[idx + 1]?.startTime ?? duration ?? 0)
                }))
                setChaptersCues(withEnds)
            }

            if (chaptersTrack.cues && chaptersTrack.cues.length > 0) {
                updateCues()
            }

            chaptersTrack.addEventListener('cue-change', updateCues)
            return () => {
                chaptersTrack.removeEventListener('cue-change', updateCues)
            }
        }
    }, [textTracks, duration, chaptersUrl])

    // ----------------------
    // onTimeUpdate -> forward to parent but suppress progress emit during hover scrubs
    // ----------------------
    const onTimeUpdate = (detail: any) => {
        const time = detail.currentTime
        const dur = detail.duration

        if (onTimeUpdateProp) onTimeUpdateProp(time)

        if (onProgress && time && dur && !isHovering.current) {
            const progress = (time / dur) * 100
            if (Number.isFinite(progress)) onProgress(progress)
        }
    }

    const onEnded = () => {
        onComplete?.()
    }

    // ----------------------
    // Handlers for container clicks (toggle play/pause) and double-click fullscreen
    // We implement container clicks rather than vidstack Gesture toggle to avoid conflicts.
    // ----------------------
    const handleContainerClick = (e: React.MouseEvent) => {
        // click on container toggles play/pause, but avoid when interacting with slider (slider stops propagation)
        if (!playerRef.current) return
        if (playerRef.current.paused) remote.play(e.nativeEvent)
        else remote.pause(e.nativeEvent)
    }

    const handleContainerDoubleClick = () => {
        // Toggle fullscreen via remote
        if (!playerRef.current) return
        const fs = (playerRef.current as any).fullscreen
        if (fs) remote.exitFullscreen()
        else remote.enterFullscreen()
    }

    // ----------------------
    // Render
    // ----------------------
    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 group select-none"
            onClick={handleContainerClick}
            onDoubleClick={handleContainerDoubleClick}
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

                {/* Watermark */}
                <div className="absolute inset-0 pointer-events-none z-[50] overflow-hidden">
                    <DynamicWatermark
                        userEmail={userEmail}
                        userId={userId}
                        sessionId={sessionId}
                        ipAddress={ipAddress}
                    />
                </div>

                {/* Controls */}
                <Controls.Root className="absolute inset-0 z-[60] flex flex-col justify-between opacity-0 transition-opacity duration-300 data-[visible]:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">

                    <Controls.Group className="w-full p-4 pointer-events-auto"></Controls.Group>

                    {/* Center Play Overlay (pointer-events-none so clicks pass through to container) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <PlayPauseOverlay />
                    </div>

                    <Controls.Group className="w-full px-4 pb-2 mt-auto pointer-events-auto">
                        <div className="flex flex-col w-full">

                            {/* -----------------------
                  TIME SLIDER (hover scrub)
                 ----------------------- */}
                            <TimeSlider.Root
                                className="relative w-full h-8 group/slider flex items-center cursor-pointer select-none touch-none"
                                // NOTE: slider events must stop propagation so container click doesn't toggle play on timeline interactions
                                onPointerEnter={() => {
                                    // no-op; we start session on first pointer move to avoid accidental pausing
                                }}
                                onPointerMove={(e: any) => {
                                    if (!playerRef.current) return

                                    // Start session if not active
                                    if (!hoverRef.current.isHovering) {
                                        hoverRef.current.originalTime = playerRef.current.currentTime ?? 0

                                        // robustly determine wasPlaying (true if not paused)
                                        const isPlaying = !playerRef.current.paused
                                        hoverRef.current.wasPlaying = isPlaying
                                        hoverRef.current.isHovering = true
                                        isHovering.current = true

                                        // IMPORTANT: do NOT call remote.pause(...) here if avoidable.
                                        // We may pause if you prefer, but pausing can produce "programmatic pause" states.
                                        // To emulate YouTube, we will NOT call remote.pause() — we will set currentTime and rely on the browser
                                        // to show frames. However some platforms benefit from a short pause; if necessary use:
                                        // remote.pause()
                                    }

                                    // compute hoverTime from pointer position
                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                    const x = e.clientX - rect.left
                                    const pct = Math.max(0, Math.min(1, x / rect.width))
                                    setHoverPct(pct * 100)

                                    if (!duration || !Number.isFinite(duration)) return
                                    const time = pct * duration
                                    setHoverTime(time)

                                    // Use RAF for smooth updates
                                    if (rafRef.current) cancelAnimationFrame(rafRef.current)
                                    rafRef.current = requestAnimationFrame(() => {
                                        if (playerRef.current) {
                                            // update currentTime to show frame at hover pos
                                            playerRef.current.currentTime = time
                                        }
                                    })
                                }}
                                onPointerLeave={() => {
                                    // If we never started a hover session, nothing to do
                                    if (!hoverRef.current.isHovering) return
                                    if (rafRef.current) cancelAnimationFrame(rafRef.current)

                                    // End hover session
                                    const wasPlaying = hoverRef.current.wasPlaying
                                    hoverRef.current.isHovering = false
                                    isHovering.current = false
                                    setHoverTime(null)

                                    // Restore original time and then restore play/pause state deterministically
                                    if (playerRef.current) {
                                        playerRef.current.currentTime = hoverRef.current.originalTime ?? playerRef.current.currentTime

                                        // Restore playing state deterministically using remote API with playerRef
                                        // if wasPlaying -> play, else -> pause
                                        setTimeout(() => {
                                            if (!playerRef.current) return
                                            if (wasPlaying) remote.play()
                                            else remote.pause()
                                        }, 25)
                                    }
                                }}
                                onClick={(e: any) => {
                                    // stop propagation so container click doesn't toggle play
                                    e.stopPropagation()

                                    if (rafRef.current) cancelAnimationFrame(rafRef.current)

                                    if (hoverTime != null && playerRef.current) {
                                        const wasPlaying = hoverRef.current.wasPlaying

                                        // commit the hover time as the new playback position
                                        playerRef.current.currentTime = hoverTime

                                        // end hover state
                                        hoverRef.current.isHovering = false
                                        isHovering.current = false
                                        setHoverTime(null)

                                        // Restore play/pause state deterministically
                                        setTimeout(() => {
                                            if (!playerRef.current) return
                                            if (wasPlaying) remote.play()
                                            else remote.pause()
                                        }, 25)
                                    }
                                }}
                            >
                                <TimeSlider.Track className="relative w-full h-[3px] bg-white/20 rounded-full group-hover/slider:h-[5px] transition-all duration-200">
                                    <TimeSlider.TrackFill className="absolute top-0 left-0 h-full bg-purple-600 rounded-full z-20 w-[var(--slider-fill)] will-change-[width]" />
                                    <TimeSlider.Progress className="absolute top-0 left-0 h-full bg-white/50 rounded-full z-10 w-[var(--slider-progress)] will-change-[width]" />

                                    {chaptersCues.map((c, idx) => {
                                        const left = ((c.startTime / duration) * 100) || 0
                                        const width = (((c.endTime - c.startTime) / duration) * 100) || 0.5
                                        return (
                                            <div
                                                key={c.startTime}
                                                className="absolute top-0 h-full z-30 bg-black w-[2px] pointer-events-none"
                                                style={{ left: `${left + width}%` }}
                                            />
                                        )
                                    })}

                                    <TimeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-200 z-40 left-[var(--slider-fill)] will-change-[left] group-hover/slider:w-4 group-hover/slider:h-4" />
                                </TimeSlider.Track>

                                {/* Hover label box (time only) */}
                                {hoverTime != null && (
                                    <div
                                        className="absolute -top-12 transform -translate-x-1/2 z-50 pointer-events-none"
                                        style={{ left: `${hoverPct}%` }}
                                    >
                                        <div className="bg-black/90 text-white text-xs px-2 py-1.5 rounded-md shadow-lg border border-white/10 flex flex-col items-center min-w-[40px] whitespace-nowrap">
                                            <div className="font-bold font-mono">
                                                {(() => {
                                                    const s = Math.floor(hoverTime)
                                                    const mins = Math.floor(s / 60)
                                                    const secs = s % 60
                                                    return `${mins}:${secs.toString().padStart(2, '0')}`
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TimeSlider.Root>

                            {/* Controls row */}
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                    <PlayPauseButton playerRef={playerRef} />
                                    <div className="flex items-center gap-2 group/volume">
                                        <VolumeButton playerRef={playerRef} />
                                        <VolumeSlider.Root className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 relative h-5 flex items-center">
                                            <VolumeSlider.Track className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                <VolumeSlider.TrackFill className="absolute top-0 left-0 h-full bg-white rounded-full" />
                                            </VolumeSlider.Track>
                                            <VolumeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover/volume:opacity-100" />
                                        </VolumeSlider.Root>
                                    </div>
                                    <TimeDisplay />
                                </div>

                                <div className="flex-1 flex justify-center px-4 overflow-hidden">
                                    <CurrentChapterDisplay chaptersCues={chaptersCues} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <QualityController />
                                    <SpeedController />
                                    <ScreenshotButton containerRef={containerRef} />
                                    <FullscreenButton />
                                </div>
                            </div>
                        </div>
                    </Controls.Group>
                </Controls.Root>
            </MediaPlayer>
        </div>
    )
})

ProtectedVideoPlayer.displayName = 'ProtectedVideoPlayer'

// ----------------------
// Subcomponents
// ----------------------

function CurrentChapterDisplay({ chaptersCues }: { chaptersCues: any[] }) {
    const currentTime = useMediaState('currentTime')
    const [showFullTitle, setShowFullTitle] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const currentChapter = chaptersCues.find(c => currentTime >= c.startTime && currentTime < c.endTime)

    if (!currentChapter) return null

    const handleChapterClick = () => {
        setShowFullTitle(true)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setShowFullTitle(false)
        }, 3000)
    }

    return (
        <div className="relative flex items-center justify-center max-w-[200px] sm:max-w-[300px]">
            <button
                onClick={handleChapterClick}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-sm transition-colors cursor-pointer max-w-full"
            >
                <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                    {currentChapter.text}
                </span>
            </button>

            {showFullTitle && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap max-w-[80vw] truncate">
                        {currentChapter.text}
                    </div>
                    <div className="w-2 h-2 bg-black/90 border-r border-b border-white/10 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
            )}
        </div>
    )
}

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

function PlayPauseButton({ playerRef }: { playerRef?: React.RefObject<MediaPlayerInstance | null> }) {
    const isPaused = useMediaState('paused', playerRef)
    const remote = useMediaRemote(playerRef)

    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                if (!playerRef?.current) return
                if (playerRef.current.paused) remote.play(e.nativeEvent)
                else remote.pause(e.nativeEvent)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
        >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
        </button>
    )
}

function VolumeButton({ playerRef }: { playerRef?: React.RefObject<MediaPlayerInstance | null> }) {
    const volume = useMediaState('volume', playerRef)
    const isMuted = useMediaState('muted', playerRef)
    const remote = useMediaRemote(playerRef)

    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                if (!playerRef?.current) return
                if (isMuted) remote.unmute(e.nativeEvent)
                else remote.mute(e.nativeEvent)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
        >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
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
        <span className="text-white text-xs font-medium font-mono ml-2">
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
        ${isHovering ? 'w-auto bg-black/80' : 'w-16 hover:bg-white/20'}
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
            onClick={(e) => { e.stopPropagation(); handleScreenshot() }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors group/shot relative"
            title="Take Screenshot"
        >
            <Camera className="w-5 h-5" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/shot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
            onClick={(e) => {
                e.stopPropagation()
                if (isFullscreen) remote.exitFullscreen()
                else remote.enterFullscreen()
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
        >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
    )
}
