'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLessonComments(lessonId: string) {
    const supabase = await createClient()

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles(full_name, avatar_url, role)
            `)
            .eq('lesson_id', lessonId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching comments:', error)
            return []
        }

        return comments
    } catch (err) {
        console.error('Unexpected error fetching comments:', err)
        return []
    }
}

export async function addComment(lessonId: string, content: string, timestamp?: number, parentId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('comments')
        .insert({
            lesson_id: lessonId,
            user_id: user.id,
            content,
            timestamp,
            parent_id: parentId
        })

    if (error) throw error

    // revalidatePath(`/courses/[id]/lessons/${lessonId}`) // Removed to prevent video reload
    return { success: true }
}

export async function deleteComment(commentId: string, path: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)

    if (error) throw error

    revalidatePath(path)
    return { success: true }
}
