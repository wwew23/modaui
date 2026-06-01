"use client"

import { usePathname } from 'next/navigation'

export function PageMarker() {
  const pathname = usePathname()
  const label = pathname === '/' ? '首页' : pathname

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-full border border-input bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm">
      陆游 {label}
    </div>
  )
}
