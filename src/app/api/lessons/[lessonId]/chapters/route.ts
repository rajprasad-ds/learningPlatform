import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    const supabase = await createClient()
    const { lessonId } = await params

    const { data: lesson, error } = await supabase
        .from('lessons')
        .select('chapters, duration')
        .eq('id', lessonId)
        .single()

    if (error || !lesson) {
        console.error('Chapters API Error:', error)
        return new NextResponse('Lesson not found', { status: 404 })
    }

    const chapters = lesson.chapters as any[] || []

    if (chapters.length === 0) {
        return new NextResponse('WEBVTT', {
            headers: { 'Content-Type': 'text/vtt' }
        })
    }

    // Generate VTT content
    let vtt = 'WEBVTT\n\n'

    chapters.forEach((chapter, index) => {
        const start = formatTime(chapter.startTime)
        const end = index < chapters.length - 1
            ? formatTime(chapters[index + 1].startTime)
            : formatTime(lesson.duration || chapter.startTime + 60) // Fallback if duration missing

        vtt += `${start} --> ${end}\n`
        vtt += `${chapter.title}\n\n`
    })

    return new NextResponse(vtt, {
        headers: {
            'Content-Type': 'text/vtt',
            'Cache-Control': 'public, max-age=3600'
        },
    })
}

function formatTime(seconds: number): string {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours().toString().padStart(2, '0')
    const mm = date.getUTCMinutes().toString().padStart(2, '0')
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0')
    return `${hh}:${mm}:${ss}.${ms}`
}
