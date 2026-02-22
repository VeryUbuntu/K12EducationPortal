'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Internal helper to bypass RLS securely after we verify the user is an admin
function getAdminSupabase() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') throw new Error("Forbidden")
}

export async function addResource(formData: FormData) {
    await verifyAdmin();

    const adminSupabase = getAdminSupabase()
    const subject_id = formData.get('subject_id') as string // UUID
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const type = formData.get('type') as string // 'web_app' | 'file' | 'link'
    const access_level = formData.get('access_level') as string // 'public' | 'registered'
    const is_featured = formData.get('is_featured') === 'on' // checkbox

    const { error } = await adminSupabase.from('resources').insert({
        subject_id, title, description, url, type, access_level, is_featured
    })

    if (error) {
        console.error('Insert error:', error)
        throw new Error(`Failed to add resource: ${error.message}`)
    }

    revalidatePath('/admin/resources')
    revalidatePath('/', 'page')
    revalidatePath('/[stage]/[subject]', 'page')
    redirect(`/admin/resources?_t=${Date.now()}`)
}

export async function deleteResource(id: string) {
    await verifyAdmin();
    const adminSupabase = getAdminSupabase()

    await adminSupabase.from('resources').delete().eq('id', id)

    revalidatePath('/admin/resources')
    revalidatePath('/', 'page')
    revalidatePath('/[stage]/[subject]', 'page')
    redirect(`/admin/resources?_t=${Date.now()}`)
}

export async function updateResource(id: string, formData: FormData) {
    await verifyAdmin();

    const adminSupabase = getAdminSupabase()
    const subject_id = formData.get('subject_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const type = formData.get('type') as string
    const access_level = formData.get('access_level') as string
    const is_featured = formData.get('is_featured') === 'on'

    const { error } = await adminSupabase.from('resources').update({
        subject_id, title, description, url, type, access_level, is_featured
    }).eq('id', id)

    if (error) {
        console.error('Update error:', error)
        throw new Error(`Failed to update resource: ${error.message}`)
    }

    revalidatePath('/admin/resources')
    revalidatePath('/', 'page')
    revalidatePath('/[stage]/[subject]', 'page')
    redirect(`/admin/resources?_t=${Date.now()}`)
}
