import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateResource } from '../../actions'
import * as LucideIcons from 'lucide-react'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditResourcePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    // Fetch the existing resource
    const { data: resource } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single()

    if (!resource) {
        notFound()
    }

    // Fetch all subjects for the select dropdown
    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, stages(name)')
        .order('stage_slug', { ascending: true })

    const updateResourceWithId = updateResource.bind(null, id)

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/admin/resources">
                    <Button variant="ghost" size="icon">
                        <LucideIcons.ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">编辑资源</h1>
                    <p className="text-slate-500 mt-2">修改资源的信息和访问内容</p>
                </div>
            </div>

            <Card className="border-emerald-500/20 shadow-sm relative overflow-visible">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <LucideIcons.Edit className="w-5 h-5 text-emerald-500" />
                        编辑资源表单
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateResourceWithId} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject_id">选择学科与学段分类</Label>
                                <select id="subject_id" name="subject_id" defaultValue={resource.subject_id} className="w-full h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                                    {subjects?.map(s => (
                                        <option key={s.id} value={s.id}>{(s.stages as any)?.name} - {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">资源名称</Label>
                                <Input id="title" name="title" defaultValue={resource.title} placeholder="如：Python基础入门课程" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">资源类型</Label>
                                <select id="type" name="type" defaultValue={resource.type} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="link">外部链接 (Link)</option>
                                    <option value="file">阅读文档 (File)</option>
                                    <option value="web_app">应用程序 (WebApp)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="access_level">安全访问等级</Label>
                                <select id="access_level" name="access_level" defaultValue={resource.access_level} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="public">完全公开 (Public)</option>
                                    <option value="registered">仅注册用户限制访问</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="url">访问链接 (外部URL或本地相对路径)</Label>
                                <Input id="url" name="url" defaultValue={resource.url} placeholder="https:// 或 /chemistry/" required />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">资源介绍</Label>
                                <MarkdownEditor
                                    name="description"
                                    defaultValue={resource.description || ''}
                                    placeholder="详细介绍该资源，支持 markdown 和图片粘贴..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pb-2">
                            <input type="checkbox" id="is_featured" name="is_featured" defaultChecked={resource.is_featured} className="rounded text-primary h-4 w-4" />
                            <Label htmlFor="is_featured" className="font-medium cursor-pointer">推送至“首页精选推荐”优先展示</Label>
                        </div>

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" className="w-full md:w-auto px-8" asChild>
                                <Link href="/admin/resources">取消修改</Link>
                            </Button>
                            <Button type="submit" className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700">保存修改</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
