'use server'

import { createClient } from '@/lib/supabase/server'
import { Assignment } from '@/types'
import { revalidatePath } from 'next/cache'

export async function enrollCourse(courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('enrollments')
        .insert({
            user_id: user.id,
            course_id: courseId,
        })

    if (error) {
        // Check for duplicate enrollment or other errors
        if (error.code === '23505') { // Unique violation
            return { message: 'Already enrolled' }
        }
        throw new Error(error.message)
    }

    revalidatePath(`/courses/${courseId}`)
}

export async function submitAssignment(lessonId: string, fileUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('assignments')
        .insert({
            lesson_id: lessonId,
            student_id: user.id,
            file_url: fileUrl,
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as Assignment
}
