import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.role === 'admin'
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                <Link href="/" className="text-xl font-bold text-primary flex items-center tracking-tight hover:opacity-80 transition-opacity">
                    <img src="/logo.svg" alt="SXU.com Logo" className="h-8 w-8 mr-2" />
                    SXU.com
                    <span className="hidden sm:inline-block text-sm text-slate-400 font-medium ml-3 self-end md:-mb-0.5">K12 Education Portal</span>
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <span className="hidden sm:inline-block text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{user.email}</span>

                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="secondary" size="sm" className="font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200">管理后台</Button>
                                </Link>
                            )}

                            <form action="/auth/signout" method="post">
                                <Button variant="outline" size="sm" type="submit" className="border-slate-200">登出</Button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">登录 / 注册</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
