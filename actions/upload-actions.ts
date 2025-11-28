'use server'

import { uploadVideo } from '@/lib/bunny-stream'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadVideoAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const lessonId = formData.get('lessonId') as string

    if (!file || !title || !lessonId) {
        throw new Error('Missing required fields')
    }

    try {
        // 1. Upload to Bunny.net
        const { videoId } = await uploadVideo(file, title)

        // 2. Update Lesson in Database
        const { error } = await supabase
            .from('lessons')
            .update({
                video_url: `bunny://${videoId}`,
                video_provider: 'bunny',
                video_id: videoId,
                duration: 0 // TODO: Webhook should update this later
            })
            .eq('id', lessonId)

        if (error) throw error

        revalidatePath('/teacher/courses')
        return { success: true, videoId }
    } catch (error) {
        console.error('Upload failed:', error)
        throw new Error('Failed to upload video')
    }
}
