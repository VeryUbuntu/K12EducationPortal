import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as LucideIcons from 'lucide-react'

export default async function AdminDashboardPage() {
    // 1. Used strictly for checking if the current HTTP request belongs to an admin.
    // (Already verified in layout.tsx, but this is the session-aware client)
    const supabase = await createClient()

    // 2. Used to fetch ALL system data bypassing Row Level Security (RLS).
    // The profiles table by default restricts users to only see their own profile.
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Execute aggregated queries using the Admin client
    // 1. Total registered users
    const { count: userCount } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // 2. Today's unique page views aggregation
    const todayDate = new Date().toISOString().split('T')[0]
    const { data: todayVisits } = await supabaseAdmin
        .from('site_visits')
        .select('views_count')
        .eq('visited_at', todayDate)

    const totalTodayVisits = todayVisits?.reduce((sum, row) => sum + row.views_count, 0) || 0

    // 3. Total active resources count
    const { count: resourceCount } = await supabaseAdmin
        .from('resources')
        .select('*', { count: 'exact', head: true })

    // 4. Detail list fetches
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

    const { data: visitsDetail } = await supabaseAdmin
        .from('site_visits')
        .select('page_path, views_count, visited_at')
        .order('visited_at', { ascending: false })
        .order('views_count', { ascending: false })
        .limit(30)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">总览数据</h1>
                <p className="text-slate-500 mt-2">点击下方卡片模块的折叠栏，可查看详细统计名单。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users Section */}
                <div className="space-y-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">总注册用户</CardTitle>
                            <LucideIcons.Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-900">{userCount || 0}</div>
                        </CardContent>
                    </Card>

                    <details className="group bg-white rounded-xl border shadow-sm cursor-pointer overflow-hidden transition-all">
                        <summary className="px-5 py-4 font-semibold list-none flex justify-between items-center text-slate-700 select-none hover:bg-slate-50">
                            <span className="flex items-center gap-2"><LucideIcons.List className="w-4 h-4 text-blue-500" /> 查看最新注册名单</span>
                            <LucideIcons.ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                        </summary>
                        <div className="border-t max-h-[400px] overflow-auto bg-slate-50/30">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 bg-white sticky top-0 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">邮箱地址</th>
                                        <th className="px-4 py-3 font-medium">角色</th>
                                        <th className="px-4 py-3 font-medium">注册时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiles?.map((profile, index) => (
                                        <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{profile.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-[10px] rounded-full uppercase ${profile.role === 'admin' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                                                    {profile.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {new Date(profile.created_at).toLocaleString('zh-CN', { hour12: false })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>

                {/* Visits Section */}
                <div className="space-y-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">今日页面总浏览量 (PV)</CardTitle>
                            <LucideIcons.Activity className="h-5 w-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-900">{totalTodayVisits}</div>
                        </CardContent>
                    </Card>

                    <details className="group bg-white rounded-xl border shadow-sm cursor-pointer overflow-hidden transition-all">
                        <summary className="px-5 py-4 font-semibold list-none flex justify-between items-center text-slate-700 select-none hover:bg-slate-50">
                            <span className="flex items-center gap-2"><LucideIcons.MousePointerClick className="w-4 h-4 text-emerald-500" /> 查看近期页面浏览量</span>
                            <LucideIcons.ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                        </summary>
                        <div className="border-t max-h-[400px] overflow-auto bg-slate-50/30">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 bg-white sticky top-0 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">受访路由</th>
                                        <th className="px-4 py-3 font-medium text-right">浏览量(PV)</th>
                                        <th className="px-4 py-3 font-medium text-right">日期</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitsDetail?.map((vd, index) => (
                                        <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs text-emerald-600">{vd.page_path}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{vd.views_count}</td>
                                            <td className="px-4 py-3 text-right text-slate-500 text-xs">{vd.visited_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>
            </div>

            {/* Summary Resources */}
            <Card className="border-l-4 border-l-amber-500 shadow-sm w-full lg:w-1/2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">资源收录总量</CardTitle>
                    <LucideIcons.PackageOpen className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black text-slate-900">{resourceCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">在左侧【资源与分类管理】中继续添加</p>
                </CardContent>
            </Card>
        </div>
    )
}
