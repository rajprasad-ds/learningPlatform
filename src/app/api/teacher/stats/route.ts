import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // 1. Get Course Count
    const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

    // 2. Get Student Count (Unique students enrolled in teacher's courses)
    // We need to join enrollments with courses to filter by teacher_id
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id, courses!inner(teacher_id)')
        .eq('courses.teacher_id', user.id)

    // Count unique user_ids
    const uniqueStudents = new Set(enrollments?.map(e => e.user_id)).size

    // 3. Get Revenue (Sum of completed payments for teacher's courses)
    const { data: payments } = await supabase
        .from('payments')
        .select('amount, courses!inner(teacher_id)')
        .eq('courses.teacher_id', user.id)
        .eq('status', 'completed')

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    return NextResponse.json({
        courseCount: courseCount || 0,
        studentCount: uniqueStudents || 0,
        revenue: totalRevenue
    })
}
