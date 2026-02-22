'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import * as LucideIcons from 'lucide-react'

function GlobalLoaderInner() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Automatically hide spinner on route change
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsLoading(false)
    }, [pathname, searchParams])

    useEffect(() => {
        const handleStartLoading = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            // Wait 200ms before showing loader. Instant Next.js cache hits will never show it!
            timeoutRef.current = setTimeout(() => setIsLoading(true), 200)
        }

        // Intercept native navigation clicks
        const handleAnchorClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return
            const href = target.getAttribute('href')
            if (!href) return

            // Ignore external and special actions
            if (target.getAttribute('target') === '_blank' || href.startsWith('#') || e.metaKey || e.ctrlKey || e.shiftKey) return

            if (href.startsWith('/') || href.startsWith(window.location.origin)) {
                // If it resolves back to identical URL, don't spin
                const url = new URL(href, window.location.origin)
                if (url.pathname === pathname && url.search === searchParams.toString()) return

                handleStartLoading()
            }
        }

        // Intercept form submissions
        const handleFormSubmit = () => {
            handleStartLoading()
            // Failsafe limit for forms to prevent infinite un-dismissible loading lock
            setTimeout(() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                setIsLoading(false)
            }, 8000)
        }

        document.addEventListener('click', handleAnchorClick, true)
        document.addEventListener('submit', handleFormSubmit, true)

        return () => {
            document.removeEventListener('click', handleAnchorClick, true)
            document.removeEventListener('submit', handleFormSubmit, true)
        }
    }, [pathname, searchParams])

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white/95 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-slate-100/50">
                <LucideIcons.Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-medium text-slate-700 tracking-wider">正在极速加载中，请稍候...</p>
            </div>
        </div>
    )
}

export function GlobalLoader() {
    return (
        <Suspense fallback={null}>
            <GlobalLoaderInner />
        </Suspense>
    )
}
