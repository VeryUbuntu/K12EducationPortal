import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addResource, deleteResource } from './actions'
import * as LucideIcons from 'lucide-react'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import Link from 'next/link'

export default async function ResourcesAdminPage() {
    const supabase = await createClient()

    // Fetch recent resources with their subject/stage context
    const { data: resources } = await supabase
        .from('resources')
        .select('*, subjects(id, name, stages(name))')
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch all subjects for the select dropdown
    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, stages(name)')
        .order('stage_slug', { ascending: true })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">资源与内容管理</h1>
                <p className="text-slate-500 mt-2">部署各种内外部学习工具、文档资料。</p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Add Form */}
                <Card className="border-emerald-500/20 shadow-sm relative overflow-visible">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <LucideIcons.UploadCloud className="w-5 h-5 text-emerald-500" />
                            发布新资源
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={addResource} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_id">选择学科与学段分类</Label>
                                    <select id="subject_id" name="subject_id" className="w-full h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                                        {subjects?.map(s => (
                                            <option key={s.id} value={s.id}>{(s.stages as any)?.name} - {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">资源名称</Label>
                                    <Input id="title" name="title" placeholder="如：Python基础入门课程" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">资源类型</Label>
                                    <select id="type" name="type" className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="link">外部链接 (Link)</option>
                                        <option value="file">阅读文档 (File)</option>
                                        <option value="web_app">应用程序 (WebApp)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="access_level">安全访问等级</Label>
                                    <select id="access_level" name="access_level" className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="public">完全公开 (Public)</option>
                                        <option value="registered">仅注册用户限制访问</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="url">访问链接 (外部URL或本地相对路径)</Label>
                                    <Input id="url" name="url" placeholder="https:// 或 /chemistry/" required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">资源介绍</Label>
                                    <MarkdownEditor
                                        name="description"
                                        placeholder="详细介绍该资源，支持 markdown 和图片粘贴..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pb-2">
                                <input type="checkbox" id="is_featured" name="is_featured" className="rounded text-primary h-4 w-4" />
                                <Label htmlFor="is_featured" className="font-medium cursor-pointer">推送至“首页精选推荐”优先展示</Label>
                            </div>

                            <Button type="submit" className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700">保存资源并发布</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-4">已发布资源列表</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources?.map(res => (
                            <Card key={res.id} className="relative shadow-sm hover:shadow-md transition-shadow">
                                {res.access_level === 'registered' && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
                                            <LucideIcons.Lock className="w-3 h-3" /> 受保护
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl pr-12">{res.title}</CardTitle>
                                    <CardDescription>
                                        {(res.subjects?.stages as any)?.name} / {res.subjects?.name} | {res.type === 'web_app' ? 'Web应用' : res.type === 'file' ? '文档' : '链接'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col justify-between gap-4 h-full">
                                    <div>
                                        <div className="mb-2 max-h-[150px] overflow-y-auto">
                                            <MarkdownRenderer content={res.description || ''} />
                                        </div>
                                        <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block text-slate-500 max-w-full truncate">
                                            {res.url}
                                        </p>
                                    </div>
                                    <div className="pt-2 flex justify-end gap-2">
                                        <Link href={`/admin/resources/${res.id}/edit`}>
                                            <Button variant="outline" size="sm" type="button" className="text-slate-500 hover:text-primary hover:bg-slate-50">
                                                <LucideIcons.Edit className="w-4 h-4 mr-2" /> 编辑
                                            </Button>
                                        </Link>
                                        <form action={async () => {
                                            'use server'
                                            await deleteResource(res.id)
                                        }}>
                                            <Button variant="outline" size="sm" type="submit" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200">
                                                <LucideIcons.Trash2 className="w-4 h-4 mr-2" /> 移除
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {(!resources || resources.length === 0) && (
                        <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            暂无发布的资源
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
