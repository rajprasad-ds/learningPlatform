'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MouseEvent, useRef } from 'react'

interface SpringTextProps {
    text: string
    className?: string
}

export function SpringText({ text, className }: SpringTextProps) {
    const mouseX = useMotionValue(Infinity)

    function onMouseMove({ clientX }: MouseEvent) {
        mouseX.set(clientX)
    }

    function onMouseLeave() {
        mouseX.set(Infinity)
    }

    return (
        <div
            className="flex items-center justify-center cursor-default"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            {text.split('').map((char, i) => (
                <Letter
                    key={i}
                    char={char}
                    mouseX={mouseX}
                    className={className}
                />
            ))}
        </div>
    )
}

function Letter({ char, mouseX, className }: {
    char: string
    mouseX: any
    className?: string
}) {
    const ref = useRef<HTMLSpanElement>(null)

    const distance = useTransform(mouseX, (val) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect || typeof val !== 'number') return Infinity

        const centerX = rect.left + rect.width / 2
        return val - centerX
    })

    // Physics Config
    // 1. Horizontal Repulsion (Linear Spring)
    const x = useTransform(distance, (d) => {
        if (d === Infinity) return 0
        const absDistance = Math.abs(d)
        const range = 150 // Influence range
        if (absDistance > range) return 0

        const force = (1 - absDistance / range) * 100
        return d < 0 ? force : -force
    })

    // 2. Spring Physics
    const springX = useSpring(x, { stiffness: 300, damping: 10, mass: 0.8 })

    // 3. Stretch (ScaleX) proportional to Elongation
    const scaleX = useTransform(springX, (currentX) => {
        return 1 + Math.abs(currentX) * 0.005
    })

    const smoothScaleX = useSpring(scaleX, { stiffness: 400, damping: 15 })

    // Color shift based on displacement
    // Initial: Purple (#a855f7), Active: Cyan (#22d3ee)
    const color = useTransform(springX, [-50, 0, 50], ['#22d3ee', '#a855f7', '#22d3ee'])

    return (
        <motion.span
            ref={ref}
            style={{
                x: springX,
                scaleX: smoothScaleX,
                color
            }}
            className={`inline-block mx-[2px] ${className}`}
        >
            {char === ' ' ? '\u00A0' : char}
        </motion.span>
    )
}
