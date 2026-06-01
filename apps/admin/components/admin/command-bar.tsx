'use client';

import { Search } from 'lucide-react';

interface CommandBarProps {
  onCommand: (command: string) => void;
}

export function CommandBar({ onCommand }: CommandBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value) {
        onCommand(value);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div className="h-12 flex items-center px-4 bg-card border-t border-border">
      <div className="flex-1 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="输入指令或搜索..."
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-secondary text-[10px] text-muted-foreground font-mono">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </div>
    </div>
  );
}
