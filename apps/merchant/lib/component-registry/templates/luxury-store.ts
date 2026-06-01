import { Data } from "@puckeditor/core"

export const luxuryStoreTemplate: Data = {
  content: [
    {
      type: "Navbar",
      props: {
        logoText: "LUXE",
        links: ["高级定制", "成衣系列", "臻品配饰", "品牌故事", "VIP"],
        cartIcon: true
      }
    },
    {
      type: "MinimalHero",
      props: {
        title: "永恒经典",
        subtitle: "奢华不是炫耀，而是对品质的追求",
        background: "#fdfcfb",
        ctaText: "臻享奢华"
      }
    },
    {
      type: "FeatureSection",
      props: {
        title: "匠心之作",
        subtitle: "每一件都是艺术品",
        features: [
          { icon: "👑", title: "顶级材质", description: "稀有皮革，珍贵宝石" },
          { icon: "✂️", title: "手工打造", description: "巴黎工坊，世代传承" },
          { icon: "🎁", title: "专属定制", description: "独一无二，只为您" }
        ]
      }
    },
    {
      type: "ProductGrid",
      props: {
        title: "臻品推荐",
        subtitle: "本季限量",
        columns: 3,
        products: [
          { name: "鳄鱼皮手袋", price: "¥128,000", image: "https://picsum.photos/400/400?random=110" },
          { name: "高级定制礼服", price: "¥68,000", image: "https://picsum.photos/400/400?random=111" },
          { name: "18K金项链", price: "¥38,000", image: "https://picsum.photos/400/400?random=112" }
        ]
      }
    },
    {
      type: "Testimonials",
      props: {
        title: "VIP 客户",
        subtitle: "来自全球的尊贵客户",
        testimonials: [
          { name: "匿名", role: "私人银行家", content: "品牌的服务和品质都是顶级的。", rating: 5 },
          { name: "匿名", role: "企业家", content: "参加过多次 VIP 活动，体验非常好。", rating: 5 },
          { name: "匿名", role: "收藏家", content: "限量系列的设计和工艺都无可挑剔。", rating: 5 }
        ]
      }
    },
    {
      type: "Footer",
      props: {
        logoText: "LUXE",
        copyright: "© 2026 LUXE. All rights reserved."
      }
    }
  ],
  root: { props: { title: "LUXE - 奢华精品" } }
}
