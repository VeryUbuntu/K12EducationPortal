import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as LucideIcons from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

export default async function ResourceDetailPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params
    const supabase = await createClient()

    // Fetch the existing resource
    const { data: resource } = await supabase
        .from('resources')
        .select('*, subjects(id, name, stage_slug, stages(name))')
        .eq('id', id)
        .single()

    if (!resource) {
        notFound()
    }

    const { data: { user } } = await supabase.auth.getUser()

    const typeIcons: any = { web_app: LucideIcons.AppWindow, file: LucideIcons.FileText, link: LucideIcons.Link }
    const IconType = typeIcons[resource.type] || LucideIcons.Link

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href={`/${(resource.subjects as any)?.stage_slug}/${(resource.subjects as any)?.slug || ''}`}>
                    <Button variant="ghost" size="icon"><LucideIcons.ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{resource.title}</h1>
                    <p className="text-muted-foreground mt-1">所属分类：{(resource.subjects?.stages as any)?.name} / {resource.subjects?.name}</p>
                </div>
            </div>

            <Card className="relative hover:border-primary/50 transition-colors shadow-lg">
                {resource.access_level === 'registered' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-sm font-semibold bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full">
                        <LucideIcons.Lock className="w-4 h-4" />
                        受保护：仅限注册用户
                    </div>
                )}
                {resource.access_level === 'public' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-sm font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                        <LucideIcons.Unlock className="w-4 h-4" />
                        完全公开
                    </div>
                )}

                <CardHeader className="pb-4 pt-10 border-b border-slate-100">
                    <CardTitle className="text-2xl flex items-center gap-3 pr-40">
                        <IconType className="w-8 h-8 text-primary shrink-0" />
                        <span>{resource.title}</span>
                    </CardTitle>
                    <CardDescription className="capitalize mt-2">
                        资源类型：{resource.type === 'web_app' ? 'Web应用 (Web App)' : resource.type === 'file' ? '文档文件 (File)' : '外部链接 (Link)'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="mb-8 min-h-[200px] prose prose-slate max-w-none">
                        <MarkdownRenderer content={resource.description || '暂无详细介绍。'} />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-8 border-t border-slate-100 bg-slate-50/50 rounded-lg -mx-4 -mb-4 px-4">
                        {/* Auth Guarding the Resource Link */}
                        {resource.access_level === 'registered' && !user ? (
                            <div className="text-center space-y-4 w-full">
                                <p className="text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded-lg font-medium inline-block w-full max-w-lg shadow-sm">🔒 此项目为内部专属资源，您需要登录后才能进行访问。</p>
                                <Link href={`/login?next=/resource/${resource.id}`} className="block w-full sm:w-auto mx-auto pt-2">
                                    <Button size="lg" className="w-full sm:w-auto px-12 bg-primary shadow-md hover:shadow-lg transition-all h-14 text-lg">立即登录 / 注册</Button>
                                </Link>
                            </div>
                        ) : (
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto mx-auto group">
                                <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md group-hover:shadow-lg transition-all">
                                    <LucideIcons.ExternalLink className="w-5 h-5 mr-3" />
                                    开启访问之旅
                                </Button>
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
