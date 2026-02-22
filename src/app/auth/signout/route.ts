import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Nginx 反向代理下，必须通过真实头获取域名，否则默认跳回本地 Node 进程 URL
    const host = request.headers.get('host') ?? 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') ?? 'http'

    return NextResponse.redirect(new URL('/', `${protocol}://${host}`), {
        status: 302,
    })
}
