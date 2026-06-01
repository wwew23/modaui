export interface ComponentSchema {
  name: string
  category: string
  description: string
  props: Record<string, string>
}

export interface ComponentInfo {
  schema: ComponentSchema
  defaultProps: any
}

export const componentSchemas: Record<string, ComponentInfo> = {
  MinimalHero: {
    schema: {
      name: "MinimalHero",
      category: "hero",
      description: "简约风格的 Hero 首屏组件",
      props: {
        title: "string",
        subtitle: "string",
        ctaText: "string",
        background: "string"
      }
    },
    defaultProps: {
      title: "欢迎来到我们的商店",
      subtitle: "发现优质产品，享受购物体验",
      ctaText: "立即探索",
      background: "#f8fafc"
    }
  },
  ProductGrid: {
    schema: {
      name: "ProductGrid",
      category: "product",
      description: "商品网格展示组件",
      props: {
        title: "string",
        subtitle: "string",
        columns: "number",
        products: "array"
      }
    },
    defaultProps: {
      title: "热门商品",
      subtitle: "精选优质产品",
      columns: 3,
      products: []
    }
  },
  FeatureSection: {
    schema: {
      name: "FeatureSection",
      category: "marketing",
      description: "功能特性展示组件",
      props: {
        title: "string",
        subtitle: "string",
        features: "array"
      }
    },
    defaultProps: {
      title: "特色功能",
      subtitle: "",
      features: []
    }
  },
  Testimonials: {
    schema: {
      name: "Testimonials",
      category: "marketing",
      description: "用户评价展示组件",
      props: {
        title: "string",
        subtitle: "string",
        testimonials: "array"
      }
    },
    defaultProps: {
      title: "用户评价",
      subtitle: "",
      testimonials: []
    }
  },
  Navbar: {
    schema: {
      name: "Navbar",
      category: "layout",
      description: "导航栏组件",
      props: {
        logo: "string",
        logoText: "string",
        links: "array",
        cartIcon: "boolean"
      }
    },
    defaultProps: {
      logo: "",
      logoText: "ModaUI",
      links: ["首页", "商品", "关于", "联系"],
      cartIcon: true
    }
  },
  Footer: {
    schema: {
      name: "Footer",
      category: "layout",
      description: "页脚组件",
      props: {
        logoText: "string",
        copyright: "string",
        links: "array"
      }
    },
    defaultProps: {
      logoText: "ModaUI",
      copyright: "© 2026 ModaUI Commerce OS",
      links: ["关于我们", "联系我们", "隐私政策", "服务条款"]
    }
  }
}
