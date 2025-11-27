'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedVideoPlayer } from '@/components/video/protected-video-player'
import { generateVideoToken, markLessonComplete, trackVideoProgress, getLessonById } from '@/actions/video-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface LessonViewerProps {
    params: Promise<{ id: string; lessonId: string }>
}

export default function LessonViewer({ params }: LessonViewerProps) {
    const { id, lessonId } = use(params)
    const router = useRouter()
    const [lesson, setLesson] = useState<any>(null)
    const [videoToken, setVideoToken] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completed, setCompleted] = useState(false)

    useEffect(() => {
        loadLesson()
    }, [lessonId])

    const loadLesson = async () => {
        try {
            setLoading(true)
            setError(null)

            const lessonData = await getLessonById(lessonId)
            setLesson(lessonData)

            const token = await generateVideoToken(lessonId)
            setVideoToken(token)

            setLoading(false)
        } catch (err: any) {
            setError(err.message || 'Failed to load lesson')
            setLoading(false)
        }
    }

    const handleProgress = async (progress: number) => {
        try {
            await trackVideoProgress(lessonId, progress)
        } catch (err) {
            console.error('Failed to track progress:', err)
        }
    }

    const handleComplete = async () => {
        try {
            await markLessonComplete(lessonId)
            setCompleted(true)
        } catch (err) {
            console.error('Failed to mark complete:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="text-red-500 mb-4">Error</div>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!lesson || !videoToken) {
        return null
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <Link href={`/courses/${id}`}>
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>
                </Link>

                <div className="mb-8">
                    <ProtectedVideoPlayer
                        videoUrl={videoToken.videoUrl}
                        userEmail={videoToken.watermark.userEmail}
                        userId={videoToken.watermark.userId}
                        sessionId={videoToken.watermark.sessionId}
                        ipAddress={videoToken.watermark.ipAddress}
                        onProgress={handleProgress}
                        onComplete={handleComplete}
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{lesson.title}</span>
                                    {completed && (
                                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-normal">
                                            <CheckCircle className="w-4 h-4" />
                                            Completed
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    No description available.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Navigation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous Lesson
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    Next Lesson
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Course Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Completed</span>
                                        <span className="font-semibold">0 / 10</span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[0%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
