'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { SpringText } from './spring-text'

export function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let width = window.innerWidth
        let height = window.innerHeight
        let mouseX = -1000
        let mouseY = -1000

        // Configuration
        const PARTICLE_COUNT = 120
        const PARTICLE_COLOR = 'rgba(192, 132, 252, 1)' // Neon Purple (Purple-400)
        const REPULSION_RADIUS = 150
        const REPULSION_STRENGTH = 2 // Mild force
        const DAMPING = 0.95 // Stability factor
        const RETURN_SPEED = 0.02 // How fast they return to flow

        // Particle System
        interface Particle {
            x: number
            y: number
            vx: number
            vy: number
            baseX: number
            baseY: number
            size: number
            angle: number
            speed: number
        }

        const particles: Particle[] = []

        const init = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height

            particles.length = 0
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const x = Math.random() * width
                const y = Math.random() * height
                particles.push({
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2 + 1, // Small, subtle dots
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.2 + 0.1, // Slow ambient flow
                })
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mouseX = e.clientX - rect.left
            mouseY = e.clientY - rect.top
        }

        const handleResize = () => {
            init()
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)

            particles.forEach((p) => {
                // 1. Ambient Flow (Vortex/Drift)
                // Simple circular drift around center + slight noise
                const centerX = width / 2
                const centerY = height / 2
                const dxCenter = p.x - centerX
                const dyCenter = p.y - centerY
                const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter)

                // Gentle orbital flow
                p.baseX += Math.cos(p.angle) * p.speed
                p.baseY += Math.sin(p.angle) * p.speed

                // Wrap around screen for base position
                if (p.baseX < 0) p.baseX = width
                if (p.baseX > width) p.baseX = 0
                if (p.baseY < 0) p.baseY = height
                if (p.baseY > height) p.baseY = 0

                // 2. Physics: Repulsion (Coulomb's Law-ish)
                const dx = mouseX - p.x
                const dy = mouseY - p.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < REPULSION_RADIUS) {
                    const force = (REPULSION_RADIUS - distance) / REPULSION_RADIUS
                    const angle = Math.atan2(dy, dx)
                    const fx = Math.cos(angle) * force * REPULSION_STRENGTH
                    const fy = Math.sin(angle) * force * REPULSION_STRENGTH

                    p.vx -= fx
                    p.vy -= fy
                }

                // 3. Physics: Return to Base (Resilience)
                // The particle wants to be at (baseX, baseY)
                const dxHome = p.baseX - p.x
                const dyHome = p.baseY - p.y

                p.vx += dxHome * RETURN_SPEED
                p.vy += dyHome * RETURN_SPEED

                // 4. Update Position & Apply Damping
                p.vx *= DAMPING
                p.vy *= DAMPING
                p.x += p.vx
                p.y += p.vy

                // Draw
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = PARTICLE_COLOR
                ctx.shadowBlur = 10
                ctx.shadowColor = PARTICLE_COLOR
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        init()
        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Particle Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-0 opacity-60"
            />

            {/* Content Layer */}
            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground mb-8">
                        Master the <br />
                        <SpringText
                            text="Unbreakable"
                            className="text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                        />
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        Engineering concepts that withstand any force.
                        Join the elite circle of mechanics who build the future.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            size="lg"
                            className="h-14 px-10 rounded-full text-lg bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-105"
                        >
                            Start Learning
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 rounded-full text-lg border-border bg-secondary/50 hover:bg-secondary/80 text-foreground backdrop-blur-sm transition-all duration-300"
                        >
                            <PlayCircle className="mr-2 w-5 h-5 text-purple-500" />
                            Watch Demo
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Subtle Vignette (Dark Mode Only) */}
            <div className="absolute inset-0 pointer-events-none dark:bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
        </section>
    )
}
