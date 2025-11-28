import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface Course {
    id: string
    title: string
    description: string | null
    price: number
    thumbnail_url: string | null
    teacher_id: string
    is_published: boolean
    created_at: string
}

interface CourseState {
    courses: Course[]
    isLoading: boolean

    // Actions
    setCourses: (courses: Course[]) => void
    addCourse: (course: Course) => void
    updateCourse: (id: string, updates: Partial<Course>) => void
    deleteCourse: (id: string) => void
    fetchCourses: () => Promise<void>
}

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    isLoading: false,

    setCourses: (courses) => set({ courses }),

    addCourse: (course) => set((state) => ({
        courses: [course, ...state.courses]
    })),

    updateCourse: (id, updates) => set((state) => ({
        courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c
        )
    })),

    deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id)
    })),

    fetchCourses: async () => {
        set({ isLoading: true })
        const supabase = createClient()

        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            set({ courses: data as Course[] })
        }
        set({ isLoading: false })
    }
}))
