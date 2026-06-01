export interface Translation {
  [key: string]: string | Translation;
}

export interface LocaleTranslations {
  zh: Translation;
  en: Translation;
}

export const translations: LocaleTranslations = {
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      loading: '加载中...',
      submit: '提交',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      yes: '是',
      no: '否',
      confirm: '确认',
      close: '关闭',
      refresh: '刷新',
      export: '导出',
      import: '导入',
      download: '下载',
      upload: '上传',
      view: '查看',
      more: '更多',
      all: '全部',
      none: '无',
      select: '选择',
      filter: '筛选',
      sort: '排序',
      clear: '清除',
      apply: '应用',
      reset: '重置'
    },
    nav: {
      dashboard: '概览',
      merchants: '商户',
      stores: '店铺',
      agents: '助理',
      queues: '队列',
      logs: '日志',
      billing: '账单',
      analytics: '分析',
      settings: '设置',
      runtime: 'Runtime',
      retail: '零售 Runtime',
      products: '商品',
      orders: '订单',
      customers: '客户',
      marketing: '营销',
      translations: '翻译',
      theme: '主题',
      platform: '平台管理'
    },
    dashboard: {
      title: '总览',
      subtitle: '查看您的业务概览和关键指标',
      welcome: '欢迎回来',
      recentActivity: '最近活动',
      quickActions: '快捷操作',
      stats: {
        totalMerchants: '商户总数',
        totalRevenue: '总收入',
        activeAgents: '活跃助理',
        pendingApprovals: '待审批'
      }
    },
    merchants: {
      title: '商户管理',
      subtitle: '管理所有入驻商户和配额',
      addMerchant: '添加商户',
      searchPlaceholder: '搜索商户名称...',
      table: {
        merchant: '商户',
        owner: '负责人',
        plan: '套餐',
        aiUsage: 'AI 用量',
        cost: '费用',
        status: '状态',
        actions: '操作'
      },
      status: {
        active: '正常',
        suspended: '暂停'
      },
      plans: {
        Starter: '入门版',
        Pro: '专业版',
        Enterprise: '企业版'
      },
      enterAdmin: '进入商户后台'
    },
    agents: {
      title: '智能助理',
      subtitle: '管理和监控AI智能体',
      status: {
        idle: '空闲',
        executing: '执行中',
        paused: '暂停',
        error: '错误'
      }
    },
    ai: {
      title: 'AI 助手',
      placeholder: '询问 AI... ⌘K',
      thinking: '正在思考...',
      howCanHelp: '有什么我可以帮助您的吗？'
    },
    sidebar: {
      defaultWorkspace: '默认工作区',
      adminPanel: '管理后台',
      adminLabel: '管理员',
      switchTo: '切换至 {locale}',
      localeZh: '中文',
      localeEn: 'English'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      close: 'Close',
      refresh: 'Refresh',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      view: 'View',
      more: 'More',
      all: 'All',
      none: 'None',
      select: 'Select',
      filter: 'Filter',
      sort: 'Sort',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset'
    },
    nav: {
      dashboard: 'Dashboard',
      merchants: 'Merchants',
      stores: 'Stores',
      agents: 'Agents',
      queues: 'Queues',
      logs: 'Logs',
      billing: 'Billing',
      analytics: 'Analytics',
      settings: 'Settings',
      runtime: 'Runtime',
      retail: 'Retail Runtime',
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      marketing: 'Marketing',
      translations: 'Translations',
      theme: 'Theme',
      platform: 'Platform Management'
    },
    dashboard: {
      title: 'Overview',
      subtitle: 'View your business overview and key metrics',
      welcome: 'Welcome back',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      stats: {
        totalMerchants: 'Total Merchants',
        totalRevenue: 'Total Revenue',
        activeAgents: 'Active Agents',
        pendingApprovals: 'Pending Approvals'
      }
    },
    merchants: {
      title: 'Merchant Management',
      subtitle: 'Manage all merchants and quotas',
      addMerchant: 'Add Merchant',
      searchPlaceholder: 'Search merchant name...',
      table: {
        merchant: 'Merchant',
        owner: 'Owner',
        plan: 'Plan',
        aiUsage: 'AI Usage',
        cost: 'Cost',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        active: 'Active',
        suspended: 'Suspended'
      },
      plans: {
        Starter: 'Starter',
        Pro: 'Pro',
        Enterprise: 'Enterprise'
      },
      enterAdmin: 'Enter Admin'
    },
    agents: {
      title: 'AI Agents',
      subtitle: 'Manage and monitor AI agents',
      status: {
        idle: 'Idle',
        executing: 'Executing',
        paused: 'Paused',
        error: 'Error'
      }
    },
    ai: {
      title: 'AI Assistant',
      placeholder: 'Ask AI... ⌘K',
      thinking: 'Thinking...',
      howCanHelp: 'How can I help you today?'
    },
    sidebar: {
      defaultWorkspace: 'Default Workspace',
      adminPanel: 'Admin Dashboard',
      adminLabel: 'Administrator',
      switchTo: 'Switch to {locale}',
      localeZh: '中文',
      localeEn: 'English'
    }
  }
};

export type Locale = 'zh' | 'en';

export function getNestedTranslation(obj: Translation, path: string): string {
  const keys = path.split('.');
  let result: any = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}
