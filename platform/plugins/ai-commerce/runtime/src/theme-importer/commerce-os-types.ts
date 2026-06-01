import { ThemeRuntime } from './runtime-core/types';
import { ProductRuntime } from '../product-runtime/types';
import { CampaignRuntime } from '../campaign-runtime/types';

/**
 * Commerce OS Unified State
 * 整合了主题、商品、活动三个核心域的运行时状态
 */
export interface CommerceOSState {
  version: string;
  lastUpdated: string;
  revision: number; // 全局修订版本号
  
  // 核心域运行时
  theme: ThemeRuntime;
  products: ProductRuntime;
  campaigns: CampaignRuntime;
  
  // 跨域元数据
  metadata: {
    activeCampaignId?: string;
    environment: 'development' | 'staging' | 'production';
  };
}

/**
 * 跨域事务数据
 */
export interface CommerceTransaction {
  id: string;
  description: string;
  timestamp: string;
  baseRevision: number;
  domainPatches: {
    theme?: any[]; // RuntimePatch[]
    products?: any[]; // 领域特定 Patch
    campaigns?: any[]; // 领域特定 Patch
  };
}
