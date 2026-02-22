import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const headersList = await headers()
    const hostname = headersList.get('host') || ''

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Automatically share session token to .sxu.com in production, enabling Eduflow SSO.
                            const domain = process.env.NODE_ENV === 'production' && hostname.includes('sxu.com')
                                ? '.sxu.com'
                                : options.domain
                            cookieStore.set(name, value, { ...options, domain })
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
