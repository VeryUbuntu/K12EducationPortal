'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addResource(formData: FormData) {
    const supabase = await createClient()
    const subject_id = formData.get('subject_id') as string // UUID
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const type = formData.get('type') as string // 'web_app' | 'file' | 'link'
    const access_level = formData.get('access_level') as string // 'public' | 'registered'
    const is_featured = formData.get('is_featured') === 'on' // checkbox

    await supabase.from('resources').insert({
        subject_id, title, description, url, type, access_level, is_featured
    })

    revalidatePath('/', 'layout')
}

export async function deleteResource(id: string) {
    const supabase = await createClient()
    await supabase.from('resources').delete().eq('id', id)

    revalidatePath('/', 'layout')
}
