import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSlide } from '../../actions'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCarouselSlidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch the slide
    const { data: slide } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('id', id)
        .single()

    if (!slide) {
        notFound()
    }

    const updateAction = updateSlide.bind(null, id)

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/carousel">
                    <Button variant="outline" size="icon">
                        <LucideIcons.ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">修改轮播图</h1>
                    <p className="text-slate-500 mt-2">更新轮播图内容和跳转链接。</p>
                </div>
            </div>

            <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <LucideIcons.Edit className="w-5 h-5 text-primary" />
                        轮播图信息
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">大字标题 (Title)</Label>
                            <Input id="title" name="title" defaultValue={slide.title} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">描述 (Description)</Label>
                            <Input id="description" name="description" defaultValue={slide.description} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">图片地址 (Image URL/相对路径)</Label>
                            <Input id="image_url" name="image_url" defaultValue={slide.image_url} required />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="link_url">跳转指向 (Link URL)</Label>
                                <Input id="link_url" name="link_url" defaultValue={slide.link_url} required />
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded text-sm text-blue-700/80 border border-blue-100">
                                <p className="font-semibold mb-1">💡 推荐链接写法：</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>跳转到单独创建的资源介绍页：<code className="bg-white px-1 py-0.5 rounded">/resource/资源的UUID</code></li>
                                    <li>跳转到原生Nginx托管组件：<code className="bg-white px-1 py-0.5 rounded">/periodic/</code> <span className="text-xs">(注：必须以/结尾)</span></li>
                                    <li>跳转到分类频道页：<code className="bg-white px-1 py-0.5 rounded">/primary/math</code></li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">排序 (数字越小越靠前)</Label>
                            <Input type="number" id="sort_order" name="sort_order" defaultValue={slide.sort_order} />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" className="w-full" asChild>
                                <Link href="/admin/carousel">取消</Link>
                            </Button>
                            <Button type="submit" className="w-full">保存修改</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
