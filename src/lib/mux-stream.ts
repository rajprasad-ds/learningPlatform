import { SignJWT } from 'jose'

// Mux API configuration
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID!
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET!

interface SignedURLOptions {
    videoId: string
    expiresIn?: number // seconds
    userEmail?: string
    userId?: string
}

/**
 * Generate a signed URL for Mux video
 * Uses JWT token authentication for time-limited access
 */
export async function generateSignedURL(options: SignedURLOptions): Promise<string> {
    const {
        videoId,
        expiresIn = 3600, // 1 hour default
        userEmail,
        userId,
    } = options

    try {
        // Create JWT token for signed URLs
        const secret = new TextEncoder().encode(MUX_TOKEN_SECRET)
        const now = Math.floor(Date.now() / 1000)
        const exp = now + expiresIn

        const token = await new SignJWT({
            sub: videoId,
            aud: 'v', // 'v' for video playback
            exp: exp,
            ...(userId && { user_id: userId }),
            ...(userEmail && { user_email: userEmail }),
        })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        // Return HLS URL with signed token
        return `https://image.mux.com/${videoId}/video.m3u8?token=${token}`
    } catch (error) {
        console.error('Failed to generate Mux signed URL:', error)
        throw new Error('Failed to generate signed URL')
    }
}

/**
 * Create a video asset in Mux (Step 1 of upload)
 */
export async function createVideoAsset(title: string) {
    const response = await fetch('https://api.mux.com/video/v1/assets', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: [],
            playback_policy: ['public'],
            metadata: {
                video_title: title,
            },
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Mux asset creation failed:', error)
        throw new Error('Failed to create video asset in Mux')
    }

    const data = await response.json() as any
    return {
        assetId: data.data.id,
        uploadUrl: data.data.upload_url, // For direct upload
    }
}

/**
 * Get upload URL for resumable upload
 */
export async function getUploadUrl(title: string) {
    const { assetId, uploadUrl } = await createVideoAsset(title)
    return {
        assetId,
        uploadUrl,
    }
}

/**
 * Get video asset details from Mux
 */
export async function getVideoAsset(assetId: string) {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch video asset')
    }

    return response.json()
}

/**
 * Delete video asset from Mux
 */
export async function deleteVideoAsset(assetId: string): Promise<void> {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to delete video asset')
    }
}

/**
 * Get video playback info (includes HLS URL)
 */
export async function getVideoPlaybackInfo(assetId: string) {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}/playback-ids`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch playback info')
    }

    const data = await response.json() as any
    
    // Find or create signed playback ID
    let playbackId = data.data?.find((p: any) => p.policy === 'signed')?.id

    if (!playbackId) {
        // Create a signed playback ID if it doesn't exist
        const createResponse = await fetch(`https://api.mux.com/video/v1/assets/${assetId}/playback-ids`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                policy: 'signed',
            }),
        })

        if (createResponse.ok) {
            const createData = await createResponse.json() as any
            playbackId = createData.data.id
        }
    }

    return {
        assetId,
        playbackId,
    }
}

/**
 * Get video statistics
 */
export async function getVideoStats(assetId: string) {
    const response = await fetch(`https://api.mux.com/data/v1/assets/${assetId}`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch video statistics')
    }

    return response.json()
}
