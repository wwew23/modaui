"use client"

import { useState, useEffect } from "react"
import { 
  Activity, 
  Bot, 
  Command, 
  Cpu, 
  History, 
  Layers, 
  Monitor,
  Play, 
  Zap,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { DiffExplainer } from "@/components/admin/diff-explainer"
import { ActionTimeline } from "./action-timeline"
import { LivePreview } from "./live-preview"
import { DAGCanvas } from "./dag-canvas"
import { LogPanel } from "./log-panel"
import { RollbackPanel } from "./rollback-panel"
import { ChatPanel } from "./chat-panel"

import { useActionStream } from "./live/use-action-stream"

export function OSConsoleView() {
  const [activeSubTab, setActiveSubTab] = useState("overview")
  const { plans, activePlan, setActivePlan } = useActionStream()
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (activePlan?.steps) {
      const step = activePlan.steps.find((s: any) => s.id === selectedStepId)
      setSelectedStep(step)
    }
  }, [selectedStepId, activePlan])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* OS TopBar */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Command className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight uppercase">Commerce OS <span className="text-muted-foreground font-normal">v2.0</span></span>
          </div>
          <div className="h-4 w-px bg-border" />
          <Badge variant="outline" className="h-6 text-[10px] gap-1.5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Kernel Online
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
             {['Overview', 'Traces', 'Settings'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveSubTab(tab.toLowerCase())}
                 className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                   activeSubTab === tab.toLowerCase() ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: DAG Canvas */}
        <div className="flex-1 flex flex-col min-h-0 bg-muted/5 relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
             <Badge className="bg-background/80 backdrop-blur border-border text-foreground shadow-sm px-3 py-1">
               {activePlan?.title || 'No Active Plan'}
             </Badge>
             {activePlan?.status === 'running' && (
               <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 animate-pulse">
                 Executing...
               </Badge>
             )}
          </div>
          <DAGCanvas 
            steps={activePlan?.steps || []} 
            onStepClick={(step) => setSelectedStepId(step.id)}
            selectedStepId={selectedStepId}
          />
          
          {/* Bottom Overlay: Runtime Events / Timeline */}
          <div className="absolute bottom-4 left-4 right-4 h-48 bg-background/80 backdrop-blur border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-10">
             <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Runtime Event Stream</span>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                   <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Success
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Running
                   </div>
                </div>
             </div>
             <div className="flex-1 overflow-x-auto p-4 flex items-center">
                <ActionTimeline steps={activePlan?.steps || []} />
             </div>
          </div>
        </div>

        {/* Center/Right: Multi-Panel Inspector */}
        <div className="w-[450px] border-l border-border bg-card flex flex-col min-h-0">
          <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
            <div className="px-4 border-b border-border bg-muted/10">
              <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-xs px-0 font-bold">Preview</TabsTrigger>
                <TabsTrigger value="inspector" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-xs px-0 font-bold">Inspector</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-xs px-0 font-bold">Logs</TabsTrigger>
                <TabsTrigger value="rollback" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-xs px-0 font-bold">Rollback</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0">
              <TabsContent value="preview" className="h-full m-0 p-4">
                <LivePreview isLoading={activePlan?.status === 'running'} />
              </TabsContent>
              
              <TabsContent value="inspector" className="h-full m-0 p-0 flex flex-col">
                <div className="flex-1 overflow-auto">
                  {selectedStep ? (
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px]">{selectedStep.domain}</Badge>
                        <h4 className="text-lg font-bold">{selectedStep.action}</h4>
                        <p className="text-xs text-muted-foreground">{selectedStep.description || 'Step detailed inspection'}</p>
                      </div>
                      
                      <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-border bg-muted/50 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase">Kernel Patch Diff</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px]">Verified</Badge>
                        </div>
                        <div className="p-4">
                           <DiffExplainer 
                              patches={selectedStep.patches || []} 
                              description={selectedStep.action}
                              actor="sidekick"
                           />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                      <Layers className="h-10 w-10 opacity-20" />
                      <p className="text-xs">Select a node from the DAG to inspect commerce mutations</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="h-full m-0 p-0">
                <LogPanel logs={logs} />
              </TabsContent>

              <TabsContent value="rollback" className="h-full m-0 p-0">
                <RollbackPanel snapshots={[]} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Bottom Chat / Sidekick Panel */}
          <div className="h-[300px] border-t border-border">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
