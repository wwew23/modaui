"use client"

import { Maximize2, Monitor, Smartphone, Layout, MousePointer2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface LivePreviewProps {
  url?: string;
  isLoading?: boolean;
}

export function LivePreview({ url, isLoading }: LivePreviewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="h-10 border-b border-border bg-muted/30 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] font-normal h-5 px-2 bg-background border-border">
            Preview: storefront-v128
          </Badge>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Monitor className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Smartphone className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7"><MousePointer2 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Layers className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center p-8">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            <span className="text-xs">Applying Patch to Runtime...</span>
          </div>
        ) : (
          <div className="w-full h-full bg-background rounded-lg shadow-2xl border border-border overflow-auto relative group">
            {/* Mock Shopify Store Content */}
            <div className="p-8 space-y-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
              <div className="h-64 w-full bg-muted rounded-xl relative overflow-hidden flex items-center justify-center">
                <span className="text-2xl font-bold tracking-tighter">HERO SECTION</span>
                {/* Diff Overlay Mock */}
                <div className="absolute inset-0 border-2 border-success/30 bg-success/5 flex items-start justify-end p-4">
                  <Badge className="bg-success text-white text-[10px]">CHANGED</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-48 bg-muted rounded-lg" />
                <div className="h-48 bg-muted rounded-lg border-2 border-success/30 bg-success/5" />
                <div className="h-48 bg-muted rounded-lg" />
              </div>
              <div className="h-32 w-full bg-muted rounded-xl" />
            </div>
            
            {/* Overlay Grid Info */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="absolute top-1/4 left-1/4 p-2 bg-foreground text-background text-[9px] font-mono rounded shadow-lg">
                  #hero-title-v1 { op: 'replace' }
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
