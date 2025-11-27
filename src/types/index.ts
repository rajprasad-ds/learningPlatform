export type Role = 'student' | 'teacher' | 'admin'

export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: Role
    created_at: string
}

export interface Course {
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    price: number
    is_published: boolean
    teacher_id: string
    created_at: string
}

export interface Module {
    id: string
    course_id: string
    title: string
    position: number
    created_at: string
}

export interface Lesson {
    id: string
    module_id: string
    title: string
    video_url: string | null // YouTube or other URL
    is_free: boolean
    position: number
    type: 'video' | 'live' | 'quiz'
    created_at: string
}

export interface Assignment {
    id: string
    lesson_id: string
    student_id: string
    file_url: string
    grade: number | null
    feedback: string | null
    submitted_at: string
}
