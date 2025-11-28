'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface DynamicWatermarkProps {
    userEmail: string
    userId: string
    sessionId: string
    ipAddress?: string
}

export function DynamicWatermark({ userEmail, userId, sessionId, ipAddress }: DynamicWatermarkProps) {
    const [position, setPosition] = useState<{ top?: string; left?: string; right?: string; bottom?: string }>({ top: '10%', left: '10%' })
    const [variant, setVariant] = useState(0)

    useEffect(() => {
        // Change position every 30 seconds
        const positionInterval = setInterval(() => {
            const positions = [
                { top: '10%', left: '10%' },
                { top: '10%', right: '10%' },
                { top: '50%', left: '50%' },
                { bottom: '10%', left: '10%' },
                { bottom: '10%', right: '10%' },
            ]
            const random = positions[Math.floor(Math.random() * positions.length)]
            setPosition(random)
        }, 30000)

        // Change variant every 30 seconds
        const variantInterval = setInterval(() => {
            setVariant((prev) => (prev + 1) % 3)
        }, 30000)

        return () => {
            clearInterval(positionInterval)
            clearInterval(variantInterval)
        }
    }, [])

    const getWatermarkText = () => {
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

        switch (variant) {
            case 0:
                return `${userEmail} | ID: ${userId}${ipAddress ? ` | IP: ${ipAddress}` : ''}`
            case 1:
                return `Session: ${sessionId} | ${timestamp}`
            case 2:
                return `${userEmail} | ${timestamp}`
            default:
                return userEmail
        }
    }

    return (
        <>
            {/* Main watermark (moving) */}
            <div
                className="absolute z-50 pointer-events-none select-none"
                style={{
                    ...position,
                    transform: 'translate(-50%, -50%)',
                    transition: 'all 2s ease-in-out',
                }}
            >
                <div className="bg-black/20 text-white/40 px-3 py-1 rounded text-xs font-mono backdrop-blur-sm">
                    {getWatermarkText()}
                </div>
            </div>

            {/* Top-left watermark (always visible) */}
            <div className="absolute top-4 left-4 z-50 pointer-events-none select-none">
                <div className="bg-black/15 text-white/30 px-2 py-1 rounded text-[10px] font-mono">
                    {userEmail}
                </div>
            </div>

            {/* Top-right watermark (always visible) */}
            <div className="absolute top-4 right-4 z-50 pointer-events-none select-none">
                <div className="bg-black/15 text-white/30 px-2 py-1 rounded text-[10px] font-mono">
                    ID: {userId}
                </div>
            </div>

            {/* Bottom-left watermark (always visible) */}
            <div className="absolute bottom-4 left-4 z-50 pointer-events-none select-none">
                <div className="bg-black/15 text-white/30 px-2 py-1 rounded text-[10px] font-mono">
                    Session: {sessionId}
                </div>
            </div>

            {/* Bottom-right watermark (warning) */}
            <div className="absolute bottom-4 right-4 z-50 pointer-events-none select-none">
                <div className="bg-black/15 text-white/30 px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Unauthorized sharing is illegal
                </div>
            </div>
        </>
    )
}
