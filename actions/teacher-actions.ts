'use server'

import { createClient } from '@/lib/supabase/server'
import { Course, Module, Lesson } from '@/types'
import { revalidatePath } from 'next/cache'

export async function createCourse(data: Partial<Course>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data: course, error } = await supabase
        .from('courses')
        .insert({
            ...data,
            teacher_id: user.id,
            is_published: false,
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/courses')
    return course as Course
}

export async function updateCourse(id: string, data: Partial<Course>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/courses/${id}`)
    revalidatePath('/dashboard/courses')
}

export async function createModule(courseId: string, title: string, position: number) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('modules')
        .insert({
            course_id: courseId,
            title,
            position,
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/courses/${courseId}`)
    return data as Module
}

export async function createLesson(moduleId: string, data: Partial<Lesson>) {
    const supabase = await createClient()

    const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
            module_id: moduleId,
            ...data,
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    // We might need to revalidate the course page where modules/lessons are shown
    // Finding the course ID would require another query or passing it in.
    // For now, we'll assume the UI handles optimistic updates or we revalidate broadly if needed.

    return lesson as Lesson
}
