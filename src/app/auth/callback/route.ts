import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const host = request.headers.get('host') ?? 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') ?? 'http'
    const origin = `${protocol}://${host}`

    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect payload
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
