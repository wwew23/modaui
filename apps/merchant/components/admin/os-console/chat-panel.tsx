"use client"

import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function ChatPanel() {
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold">Sidekick AI</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-purple-500" />
            </div>
            <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[85%]">
              你好！我是你的 AI 商业运营助手。你可以告诉我你想对店铺做的任何修改，比如“帮我策划一个夏季促销活动”或“重新排列首页的商品展示顺序”。
            </div>
          </div>
          
          <div className="flex gap-3 items-start justify-end">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%]">
              帮我把所有库存少于 10 件的商品打 8 折，并在首页展示一个促销横幅。
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="relative">
          <Textarea 
            placeholder="输入指令..." 
            className="min-h-[80px] pr-12 text-xs resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 h-8 w-8"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI 可能会产生错误，请在应用前检查生成的 Action Plan。
        </p>
      </div>
    </div>
  );
}
