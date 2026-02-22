import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { page_path } = await request.json()
        if (!page_path) return NextResponse.json({ error: 'Missing page_path' }, { status: 400 })

        const supabase = await createClient()

        // Since basic Supabase JS client doesn't handle ON CONFLICT perfectly without an RPC or complex matching,
        // We'll try to upsert manually by checking if a row exists today first.
        const today = new Date().toISOString().split('T')[0]

        const { data: existing } = await supabase
            .from('site_visits')
            .select('id, views_count')
            .eq('visited_at', today)
            .eq('page_path', page_path)
            .single()

        if (existing) {
            await supabase
                .from('site_visits')
                .update({ views_count: existing.views_count + 1 })
                .eq('id', existing.id)
        } else {
            await supabase
                .from('site_visits')
                .insert({ visited_at: today, page_path, views_count: 1 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
