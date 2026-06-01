export const SIDEKICK_ACTIONS = [
  // Product Actions
  {
    name: "smartSortCollection",
    description: "Automatically reorder products in a collection based on conversion, inventory, or margin strategies.",
    params: {
      collectionId: "string",
      strategy: "conversion | inventory | margin"
    },
    safety: "requires_confirmation",
    impact: ["product-sorting", "collection-page"]
  },
  {
    name: "generateProductCopy",
    description: "Generate AI-optimized titles, descriptions, and SEO metadata for a product.",
    params: {
      productId: "string",
      tone: "professional | creative | casual"
    },
    safety: "auto_execute",
    impact: ["product-content", "seo"]
  },
  
  // Campaign Actions
  {
    name: "activateFlashSale",
    description: "Activate a site-wide flash sale by updating theme colors, announcement banners, and product tags atomically.",
    params: {
      campaignId: "string",
      discountPercent: "number",
      primaryColor: "string (hex)",
      bannerText: "string"
    },
    safety: "requires_confirmation",
    impact: ["theme-tokens", "global-settings", "product-tags", "campaign-status"]
  },

  // Theme Actions (Existing)
  {
    name: "applyBrandProfile",
    description: "Update the store's visual identity including colors and typography.",
    params: {
      profile: "object"
    },
    safety: "requires_confirmation",
    impact: ["theme-tokens"]
  }
];
