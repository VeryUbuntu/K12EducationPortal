'use client'

import * as React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageTracker() {
    const pathname = usePathname()

    useEffect(() => {
        if (pathname && !pathname.startsWith('/admin')) {
            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page_path: pathname })
            }).catch(() => { })
        }
    }, [pathname])

    return null
}
