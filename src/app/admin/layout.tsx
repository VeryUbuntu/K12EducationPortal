import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Verify auth and admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login?next=/admin')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideIcons.ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
                <h1 className="text-2xl font-bold">无权限访问</h1>
                <p className="text-muted-foreground mt-2">只有管理员才能访问此页面。</p>
                <Link href="/" className="mt-6 underline text-primary">返回首页</Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 space-y-2">
                <h2 className="font-bold text-lg mb-4 px-4 text-slate-800 flex items-center gap-2">
                    <LucideIcons.MonitorCog className="w-5 h-5" />
                    管理中心
                </h2>
                <nav className="flex flex-col space-y-1">
                    <Link href="/admin" className="px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                        <LucideIcons.LayoutDashboard className="w-4 h-4" /> 仪表盘统计
                    </Link>
                    <Link href="/admin/carousel" className="px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                        <LucideIcons.Images className="w-4 h-4" /> 轮播图管理
                    </Link>
                    <Link href="/admin/resources" className="px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3">
                        <LucideIcons.Database className="w-4 h-4" /> 资源与分类管理
                    </Link>
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                {children}
            </main>
        </div>
    )
}
