'use server'

import { createClient } from '@/lib/supabase/server'
import { Course } from '@/types'

export async function getCourses(): Promise<Course[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return data as Course[]
}

export async function getCourse(id: string): Promise<Course | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching course:', error)
        return null
    }

    return data as Course
}
