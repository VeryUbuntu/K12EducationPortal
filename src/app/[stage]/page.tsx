import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import * as LucideIcons from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function StagePage(props: { params: Promise<{ stage: string }> }) {
    const { stage } = await props.params
    const supabase = await createClient()

    // Fetch the stage details
    const { data: stageData } = await supabase
        .from('stages')
        .select('*')
        .eq('slug', stage)
        .single()

    if (!stageData) {
        notFound()
    }

    // Fetch the subjects for this stage
    const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .eq('stage_slug', stage)

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href="/">
                    <Button variant="ghost" size="icon"><LucideIcons.ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <h1 className="text-3xl font-bold">{stageData.name} - 学科列表</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subjects?.map((sub) => {
                    // Dynamic Lucide icon lookup
                    const Icon = (LucideIcons as any)[sub.icon_name] || LucideIcons.BookOpen

                    return (
                        <Link href={`/${stage}/${sub.slug}`} key={sub.id}>
                            <Card className="h-full hover:shadow-md hover:border-primary transition-colors cursor-pointer text-center group">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/5 p-4 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle>{sub.name}</CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
