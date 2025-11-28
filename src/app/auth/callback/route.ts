import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)

        // Fetch user role to determine redirect
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role || 'student'

            if (role === 'teacher' || role === 'admin') {
                return NextResponse.redirect(`${origin}/teacher`)
            }
        }
    }

    // Default redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
}
