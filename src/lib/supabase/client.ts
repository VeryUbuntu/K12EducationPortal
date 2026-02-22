import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    let effectiveDomain: string | undefined = undefined;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && !window.location.hostname.includes('localhost')) {
        effectiveDomain = '.sxu.com';
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                domain: effectiveDomain,
                path: '/'
            }
        }
    )
}
