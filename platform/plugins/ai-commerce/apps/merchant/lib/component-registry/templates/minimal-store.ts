import { Data } from "@puckeditor/core"

export const minimalStoreTemplate: Data = {
  content: [
    {
      type: "Navbar",
      props: {
        logoText: "M",
        links: ["系列", "关于", "联系"],
        cartIcon: true
      }
    },
    {
      type: "MinimalHero",
      props: {
        title: "简约即美",
        subtitle: "LESS IS MORE",
        background: "#ffffff",
        ctaText: "浏览"
      }
    },
    {
      type: "FeatureSection",
      props: {
        title: "我们的信念",
        subtitle: "设计服务于功能",
        features: [
          { icon: "—", title: "极简设计", description: "去除一切多余" },
          { icon: "◻", title: "优质面料", description: "只选最好的" },
          { icon: "∞", title: "永恒经典", description: "超越潮流" }
        ]
      }
    },
    {
      type: "ProductGrid",
      props: {
        title: "核心系列",
        subtitle: "",
        columns: 3,
        products: [
          { name: "白 T 恤", price: "¥880", image: "https://picsum.photos/400/400?random=120" },
          { name: "黑色大衣", price: "¥4,280", image: "https://picsum.photos/400/400?random=121" },
          { name: "亚麻衬衫", price: "¥1,280", image: "https://picsum.photos/400/400?random=122" }
        ]
      }
    },
    {
      type: "Testimonials",
      props: {
        title: "",
        subtitle: "",
        testimonials: [
          { name: "Architect", role: "", content: "完美的极简主义。", rating: 5 },
          { name: "Designer", role: "", content: "真正理解简约的品牌。", rating: 5 },
          { name: "Creative", role: "", content: "我的衣橱只有这个品牌。", rating: 5 }
        ]
      }
    },
    {
      type: "Footer",
      props: {
        logoText: "M",
        copyright: "© 2026"
      }
    }
  ],
  root: { props: { title: "M - 极简主义" } }
}
