import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('videoId')
        const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
        const apiKey = process.env.BUNNY_API_KEY

        if (!videoId || !libraryId || !apiKey) {
            return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
        }

        // Stream the request body directly to Bunny.net
        // This avoids loading the entire file into memory
        const bunnyResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: 'PUT',
            headers: {
                'AccessKey': apiKey,
                'Content-Type': 'application/octet-stream',
            },
            body: request.body, // Pass the stream directly
            // @ts-ignore - duplex is needed for streaming bodies in Node/Next.js fetch
            duplex: 'half'
        })

        if (!bunnyResponse.ok) {
            const errorText = await bunnyResponse.text()
            console.error('Bunny upload failed:', errorText)
            return NextResponse.json({ error: 'Upload to provider failed' }, { status: 502 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Upload handler error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
