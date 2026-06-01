export type CampaignId = string;

export type CampaignNode = {
  id: CampaignId;
  name: string;
  status: 'planned' | 'active' | 'completed';
  startAt: string;
  endAt: string;
  config: {
    discountCode?: string;
    themeOverrides?: {
      primaryColor?: string;
      announcementText?: string;
    };
  };
};

export interface CampaignRuntime {
  metadata: {
    revision: number;
  };
  campaigns: Record<CampaignId, CampaignNode>;
}
