import crypto from 'crypto'

// Bunny.net Stream API configuration
const BUNNY_API_KEY = process.env.BUNNY_API_KEY!
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || '550852'
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || 'vz-246986e3-ec4.b-cdn.net'

interface SignedURLOptions {
    videoId: string
    expiresIn?: number // seconds
    ipAddress?: string
    userAgent?: string
}

/**
 * Generate a signed URL for Bunny.net Stream video
 * This prevents unauthorized access and enables token-based security
 */
export function generateSignedURL(options: SignedURLOptions): string {
    const {
        videoId,
        expiresIn = 3600, // 1 hour default
        ipAddress,
    } = options

    // Calculate expiration timestamp
    const expires = Math.floor(Date.now() / 1000) + expiresIn

    // Build base URL
    const baseUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`

    // Create token parameters
    const tokenParams = new URLSearchParams({
        expires: expires.toString(),
    })

    // Add IP restriction if provided
    if (ipAddress) {
        tokenParams.append('token_ip', ipAddress)
    }

    // Generate signature
    const signatureBase = `${BUNNY_LIBRARY_ID}${videoId}${expires}${ipAddress || ''}`
    const signature = crypto
        .createHmac('sha256', BUNNY_API_KEY)
        .update(signatureBase)
        .digest('hex')

    tokenParams.append('token', signature)

    return `${baseUrl}?${tokenParams.toString()}`
}

/**
 * Upload video to Bunny.net Stream
 */
/**
 * Upload video to Bunny.net Stream
 */
export async function uploadVideo(file: File, title: string): Promise<{ videoId: string; libraryId: string }> {
    // 1. Create Video Object
    const createResponse = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
        method: 'POST',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title }),
    })

    if (!createResponse.ok) {
        throw new Error('Failed to create video entry in Bunny.net')
    }

    const createData = await createResponse.json()
    const videoId = createData.guid

    // 2. Upload Video Content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream',
        },
        body: buffer,
    })

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload video content to Bunny.net')
    }

    return {
        videoId: videoId,
        libraryId: BUNNY_LIBRARY_ID,
    }
}

/**
 * Get video details from Bunny.net
 */
export async function getVideoDetails(videoId: string) {
    const response = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
            headers: {
                'AccessKey': BUNNY_API_KEY,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch video details')
    }

    return response.json()
}

/**
 * Delete video from Bunny.net
 */
export async function deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
            method: 'DELETE',
            headers: {
                'AccessKey': BUNNY_API_KEY,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to delete video')
    }
}

/**
 * Get video statistics
 */
export async function getVideoStats(videoId: string) {
    const response = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/statistics`,
        {
            headers: {
                'AccessKey': BUNNY_API_KEY,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch video statistics')
    }

    return response.json()
}
