import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addSlide, deleteSlide } from './actions'
import * as LucideIcons from 'lucide-react'

export default async function CarouselAdminPage() {
    const supabase = await createClient()

    // Fetch all slides
    const { data: slides } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('sort_order', { ascending: true })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">轮播图管理</h1>
                <p className="text-slate-500 mt-2">在这里添加或删除首页展示的大图轮播。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Add Form */}
                <Card className="lg:col-span-1 border-primary/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <LucideIcons.PlusCircle className="w-5 h-5 text-primary" />
                            新增轮播图
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={addSlide} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">大字标题 (Title)</Label>
                                <Input id="title" name="title" placeholder="例如：欢迎来到 SXU.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">描述 (Description)</Label>
                                <Input id="description" name="description" placeholder="例如：专为中小学生打造的高效学习站" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_url">图片地址 (Image URL/相对路径)</Label>
                                <Input id="image_url" name="image_url" placeholder="/images/banner1.jpg 或 http..." required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link_url">跳转指向 (Link URL)</Label>
                                <Input id="link_url" name="link_url" placeholder="/primary/math" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">排序 (数字越小越靠前)</Label>
                                <Input type="number" id="sort_order" name="sort_order" defaultValue="0" />
                            </div>
                            <Button type="submit" className="w-full">保存轮播图</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing List */}
                <div className="lg:col-span-2 space-y-4">
                    {slides?.map(slide => (
                        <Card key={slide.id} className="overflow-hidden flex flex-col md:flex-row shadow-sm">
                            <div className="w-full md:w-48 h-32 relative bg-slate-100 shrink-0">
                                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{slide.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1">{slide.description}</p>
                                    <p className="text-xs text-slate-400 mt-2">链接：{slide.link_url} | 排序：{slide.sort_order}</p>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <form action={async () => {
                                        'use server'
                                        await deleteSlide(slide.id)
                                    }}>
                                        <Button variant="destructive" size="sm" type="submit">
                                            <LucideIcons.Trash2 className="w-4 h-4 mr-1" /> 删除
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {(!slides || slides.length === 0) && (
                        <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            暂无轮播图数据
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
