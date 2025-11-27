'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, BookOpen, MessageCircle, Trophy } from 'lucide-react'

const features = [
    {
        title: 'Interactive Live Classes',
        description: 'Join real-time sessions with HD streaming. Raise your hand, ask questions, and participate in live polls.',
        icon: Video,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        title: 'Recorded Library',
        description: 'Missed a class? No worries. Access high-quality recordings of every session instantly after it ends.',
        icon: BookOpen,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    },
    {
        title: 'Instant Doubt Solving',
        description: 'Chat with mentors and peers during the class. Get your doubts resolved in real-time.',
        icon: MessageCircle,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    {
        title: 'Gamified Assignments',
        description: 'Submit assignments, earn badges, and track your progress on the leaderboard.',
        icon: Trophy,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
]

export function Features() {
    return (
        <section className="py-24 bg-secondary/20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to excel</h2>
                    <p className="text-muted-foreground text-lg">
                        We combine the best of live learning with self-paced flexibility.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-lg bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
