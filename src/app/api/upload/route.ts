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
        const assetId = searchParams.get('assetId')
        const uploadUrl = searchParams.get('uploadUrl')

        if (!assetId || !uploadUrl) {
            return NextResponse.json({ error: 'Missing assetId or uploadUrl' }, { status: 400 })
        }

        // Stream the request body directly to Mux
        // This avoids loading the entire file into memory
        const muxResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: request.body, // Pass the stream directly
            // @ts-ignore - duplex is needed for streaming bodies in Node/Next.js fetch
            duplex: 'half'
        })

        if (!muxResponse.ok) {
            const errorText = await muxResponse.text()
            console.error('Mux upload failed:', errorText)
            return NextResponse.json({ error: 'Upload to provider failed' }, { status: 502 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Upload handler error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
