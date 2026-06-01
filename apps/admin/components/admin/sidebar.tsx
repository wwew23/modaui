'use client';

import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Bot, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings,
  ChevronDown,
  ListTodo,
  Cpu
} from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import type { ActiveTab } from '@/lib/types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const menuItems = [
  { id: 'dashboard' as ActiveTab, icon: LayoutDashboard },
  { id: 'merchants' as ActiveTab, icon: Users },
  { id: 'stores' as ActiveTab, icon: Store },
  { id: 'agents' as ActiveTab, icon: Bot },
  { id: 'queues' as ActiveTab, icon: ListTodo },
  { id: 'logs' as ActiveTab, icon: FileText },
  { id: 'runtime' as ActiveTab, icon: Cpu },
  { id: 'billing' as ActiveTab, icon: CreditCard },
  { id: 'analytics' as ActiveTab, icon: BarChart3 },
  { id: 'settings' as ActiveTab, icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { locale, setLocale, t } = useI18n();
  const nextLocale = locale === 'zh' ? 'en' : 'zh';
  const nextLocaleLabel = locale === 'zh' ? t('sidebar.localeEn') : t('sidebar.localeZh');

  return (
    <aside className="w-[240px] h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white text-sidebar flex items-center justify-center font-bold text-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Studio</h1>
            <p className="text-[10px] text-sidebar-foreground/60">{t('sidebar.adminPanel')}</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-sidebar-accent text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors">
          <span className="truncate">{t('sidebar.defaultWorkspace')}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto sidebar-scroll">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const label = t(`nav.${item.id}`);

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-white text-sidebar font-medium' 
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-white">
            {t('sidebar.adminLabel').slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{t('sidebar.adminLabel')}</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">admin@studio.com</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLocale(nextLocale)}
          className="mt-3 w-full rounded-md border border-border bg-background/80 px-3 py-2 text-left text-sm text-sidebar-foreground transition hover:border-sidebar-accent hover:bg-sidebar-accent/10"
        >
          {t('sidebar.switchTo', { locale: nextLocaleLabel })}
        </button>
      </div>
    </aside>
  );
}
