import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch user role if logged in
    let userRole = 'student'

    // Check for cached role in cookies
    const cachedRole = request.cookies.get('user_role')?.value
    if (cachedRole) {
        userRole = cachedRole
    } else if (user) {
        // Fallback to DB if no cookie (and set it)
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Middleware: Failed to fetch profile role', error)
        }

        userRole = profile?.role || 'student'

        // Cache the role in a cookie for 1 hour
        supabaseResponse.cookies.set('user_role', userRole, {
            maxAge: 60 * 60,
            path: '/',
            sameSite: 'lax'
        })

        console.log('Middleware: Fetched & Cached Role:', userRole)
    }

    // Protect teacher routes
    if (request.nextUrl.pathname.startsWith('/teacher')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (userRole !== 'teacher' && userRole !== 'admin') {
            console.log('Middleware: Unauthorized access to teacher route. Redirecting to dashboard.')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
        console.log('Middleware: Auth page redirect. Role:', userRole)
        if (userRole === 'teacher' || userRole === 'admin') {
            return NextResponse.redirect(new URL('/teacher', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
