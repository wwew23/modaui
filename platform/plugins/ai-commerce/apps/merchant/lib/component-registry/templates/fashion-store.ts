import { Data } from "@puckeditor/core"

export const fashionStoreTemplate: Data = {
  content: [
    {
      type: "Navbar",
      props: {
        logoText: "MODA",
        links: ["新品", "女装", "男装", "配饰", "杂志"],
        cartIcon: true
      }
    },
    {
      type: "MinimalHero",
      props: {
        title: "2026 春夏系列",
        subtitle: "极简主义与现代美学的完美融合",
        background: "#fafafa",
        ctaText: "探索系列"
      }
    },
    {
      type: "FeatureSection",
      props: {
        title: "品牌理念",
        subtitle: "LESS IS MORE",
        features: [
          { icon: "✨", title: "精选面料", description: "意大利进口，顶级品质" },
          { icon: "🧵", title: "精湛工艺", description: "匠心打造，细节至上" },
          { icon: "🌍", title: "可持续时尚", description: "环保材料，责任生产" }
        ]
      }
    },
    {
      type: "ProductGrid",
      props: {
        title: "本季精选",
        subtitle: "编辑推荐",
        columns: 3,
        products: [
          { name: "真丝衬衫", price: "¥2,980", image: "https://picsum.photos/400/400?random=100" },
          { name: "羊毛大衣", price: "¥8,980", image: "https://picsum.photos/400/400?random=101" },
          { name: "真皮手袋", price: "¥5,680", image: "https://picsum.photos/400/400?random=102" }
        ]
      }
    },
    {
      type: "Testimonials",
      props: {
        title: "客户评价",
        subtitle: "来自全球的时尚爱好者",
        testimonials: [
          { name: "Sophie", role: "时尚编辑", content: "面料和剪裁都无可挑剔，真正的高端品质。", rating: 5 },
          { name: "Emma", role: "设计师", content: "极简但不简单，每一个细节都很到位。", rating: 5 },
          { name: "Olivia", role: "收藏家", content: "已经收集了每季新品，品质始终如一。", rating: 5 }
        ]
      }
    },
    {
      type: "Footer",
      props: {
        logoText: "MODA",
        copyright: "© 2026 MODA. All rights reserved."
      }
    }
  ],
  root: { props: { title: "MODA - 高级时尚" } }
}
