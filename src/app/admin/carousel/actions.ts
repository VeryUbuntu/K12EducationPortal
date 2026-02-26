'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSlide(formData: FormData) {
    const supabase = await createClient()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string
    const link_url = formData.get('link_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string || '0')

    await supabase.from('carousel_slides').insert({
        title, description, image_url, link_url, sort_order
    })

    revalidatePath('/', 'page')
    revalidatePath('/admin/carousel')
}

export async function deleteSlide(id: string) {
    const supabase = await createClient()
    await supabase.from('carousel_slides').delete().eq('id', id)

    revalidatePath('/', 'page')
    revalidatePath('/admin/carousel')
}

export async function updateSlide(id: string, formData: FormData) {
    const supabase = await createClient()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string
    const link_url = formData.get('link_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string || '0')

    await supabase.from('carousel_slides').update({
        title, description, image_url, link_url, sort_order
    }).eq('id', id)

    revalidatePath('/', 'layout')
    redirect(`/admin/carousel?_t=${Date.now()}`)
}
