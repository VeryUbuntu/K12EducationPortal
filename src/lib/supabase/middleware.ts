import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const domain = process.env.NODE_ENV === 'production' && !options.domain?.includes('localhost')
                            ? '.sxu.com'
                            : options.domain
                        supabaseResponse.cookies.set(name, value, { ...options, domain })
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Here you can inject any routes that need global redirection 
    // (e.g. if the user tries to access a purely protected dashboard page without logging in)
    // For dynamic resource checks (whether access_level = 'registered'), 
    // it's easier to handle those via an AuthGuard in the React Server Components 
    // because we'd need to query the database to know the access_level.

    if (!user && request.nextUrl.pathname.startsWith('/profile')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
