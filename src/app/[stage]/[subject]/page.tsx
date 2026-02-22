import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

export default async function SubjectPage(props: { params: Promise<{ stage: string, subject: string }> }) {
    const { stage, subject } = await props.params
    const supabase = await createClient()

    // Verify the stage and subject exist
    const { data: subjectData } = await supabase
        .from('subjects')
        .select('*, stages(name)')
        .eq('stage_slug', stage)
        .eq('slug', subject)
        .single()

    if (!subjectData) {
        notFound()
    }

    // Fetch resources
    const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .eq('subject_id', subjectData.id)
        .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    const typeIcons: any = { web_app: LucideIcons.AppWindow, file: LucideIcons.FileText, link: LucideIcons.Link }

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href={`/${stage}`}>
                    <Button variant="ghost" size="icon"><LucideIcons.ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{subjectData.name} ({subjectData.stages?.name})</h1>
                    <p className="text-muted-foreground mt-1">这里收录了该学科的所有精选资源</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources?.length === 0 && (
                    <p className="col-span-full text-slate-500 text-center py-10">暂无资源，敬请期待！</p>
                )}

                {resources?.map((res) => {
                    const IconType = typeIcons[res.type] || LucideIcons.Link

                    return (
                        <Card key={res.id} className="relative flex flex-col hover:border-primary/50 transition-colors">
                            {res.access_level === 'registered' && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-1 rounded">
                                    <LucideIcons.Lock className="w-3 h-3" />
                                    需登录
                                </div>
                            )}
                            {res.access_level === 'public' && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                    <LucideIcons.Unlock className="w-3 h-3" />
                                    公开
                                </div>
                            )}

                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl flex items-center gap-2 pr-16">
                                    <IconType className="w-5 h-5 text-primary shrink-0" />
                                    <span className="truncate">{res.title}</span>
                                </CardTitle>
                                <CardDescription className="capitalize">
                                    {res.type.replace('_', ' ')}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col">
                                <div className="mb-4 flex-1">
                                    <MarkdownRenderer content={res.description || ''} />
                                </div>

                                {/* Auth Guarding the Resource Link */}
                                {res.access_level === 'registered' && !user ? (
                                    <Link href={`/login?next=/${stage}/${subject}`}>
                                        <Button className="w-full" variant="secondary">登录后访问</Button>
                                    </Link>
                                ) : (
                                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                                        <Button className="w-full" variant="default">直接访问</Button>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
