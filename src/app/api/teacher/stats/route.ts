import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

    return NextResponse.json({
        courseCount: courseCount || 0,
        studentCount: 0, // Placeholder
        revenue: 0 // Placeholder
    })
}
