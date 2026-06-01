export interface UnifiedTenant {
  id: string;
  name: string;
  merchantName: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Growth' | 'Free';
  aiUsage: number;
  aiUsageDisplay?: string;
  limitPattern: string;
  status: 'active' | 'suspended' | 'Healthy' | 'Degraded';
  tokenCost: number;
  gmv?: number;
  orderCount?: number;
  runtimeStatus?: 'Healthy' | 'Suspended' | 'Degraded';
  riskStatus?: 'Safe' | 'Warning' | 'High Risk';
  lastActivity?: string;
}

export interface CrossAppNavigationConfig {
  admincBaseUrl: string;
  adminsBaseUrl: string;
  defaultPort?: number;
}

export const DEFAULT_NAV_CONFIG: CrossAppNavigationConfig = {
  admincBaseUrl: '/',
  adminsBaseUrl: '/admins',
  defaultPort: 3000
};

export function getAdminUrl(tenantId?: string): string {
  if (tenantId) {
    return `${DEFAULT_NAV_CONFIG.adminsBaseUrl}?tenant=${tenantId}`;
  }
  return DEFAULT_NAV_CONFIG.adminsBaseUrl;
}

export function getPlatformUrl(): string {
  return DEFAULT_NAV_CONFIG.admincBaseUrl;
}

export function navigateToAdmins(tenantId?: string, newTab: boolean = true) {
  const url = getAdminUrl(tenantId);
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}

export function navigateToPlatform(newTab: boolean = false) {
  const url = getPlatformUrl();
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}

export function convertMerchantStoreToUnified(merchant: any): UnifiedTenant {
  return {
    id: merchant.id,
    name: merchant.name,
    merchantName: merchant.merchantName,
    plan: merchant.plan,
    aiUsage: parseFloat(merchant.aiUsage) || 0,
    aiUsageDisplay: merchant.aiUsage,
    limitPattern: merchant.limitPattern,
    status: merchant.status,
    tokenCost: merchant.tokenCost,
    gmv: merchant.gmv,
    orderCount: merchant.orderCount,
    runtimeStatus: merchant.status === 'active' ? 'Healthy' : 'Suspended',
    riskStatus: merchant.limitPattern === '超限' ? 'Warning' : 'Safe',
    lastActivity: new Date().toLocaleTimeString('zh-CN')
  };
}

export function convertTenantToUnified(tenant: any): UnifiedTenant {
  return {
    id: tenant.id,
    name: tenant.name,
    merchantName: tenant.name,
    plan: tenant.plan,
    aiUsage: tenant.aiUsage,
    aiUsageDisplay: `${tenant.aiUsage} tokens`,
    limitPattern: `${Math.min((tenant.aiUsage / 1000000) * 100, 100)}%`,
    status: tenant.runtimeStatus === 'Suspended' ? 'suspended' : 'active',
    tokenCost: tenant.aiUsage * 0.000002,
    gmv: tenant.gmv,
    orderCount: tenant.orderCount,
    runtimeStatus: tenant.runtimeStatus,
    riskStatus: tenant.riskStatus,
    lastActivity: tenant.lastActivity
  };
}
