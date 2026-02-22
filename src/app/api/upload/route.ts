import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const filename = formData.get('filename') as string

        if (!file || !filename) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // upload requires bypassing RLS since we haven't set up the SQL policies manually
        const { data, error } = await adminSupabase.storage
            .from('resource_images')
            .upload(filename, file, {
                contentType: file.type || 'image/png',
                upsert: true
            })

        if (error) {
            console.error("Supabase Storage Error:", error)
            throw error
        }

        const { data: { publicUrl } } = adminSupabase.storage
            .from('resource_images')
            .getPublicUrl(filename)

        return NextResponse.json({ publicUrl })
    } catch (err: any) {
        console.error("Upload Route Error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
