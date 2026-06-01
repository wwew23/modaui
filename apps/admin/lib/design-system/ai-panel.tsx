'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export interface UnifiedAIPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  streamingText?: string;
  title?: string;
  placeholder?: string;
  width?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function UnifiedAIPanel({
  messages,
  onSendMessage,
  isProcessing = false,
  streamingText = '',
  title = 'AI 助手',
  placeholder = '询问 AI... ⌘K',
  width = '320px',
  isOpen = true,
  onToggle
}: UnifiedAIPanelProps) {
  const [input, setInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, isProcessing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>('[data-unified-ai-input]');
        textarea?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) {
    if (!onToggle) return null;
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-4 z-50 p-3 rounded-lg bg-card border border-border shadow-lg hover:bg-muted transition-colors"
      >
        <Bot className="h-5 w-5 text-foreground" />
      </button>
    );
  }

  return (
    <aside 
      className="border-l border-border bg-card flex flex-col shrink-0"
      style={{ width }}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {placeholder.replace('... ⌘K', '')}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex gap-3",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}>
              {msg.sender === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-foreground" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] rounded-lg px-4 py-3",
                msg.sender === 'user' 
                  ? "bg-foreground text-background" 
                  : "bg-muted text-foreground"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.timestamp && (
                  <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                )}
              </div>
              {msg.sender === 'user' && (
                <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-background" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-foreground" />
            </div>
            <div className="bg-muted text-foreground rounded-lg px-4 py-3">
              <p className="text-sm">{streamingText || '正在思考...'}</p>
            </div>
          </div>
        )}
        
        <div ref={chatBottomRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="relative">
          <Textarea
            data-unified-ai-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
