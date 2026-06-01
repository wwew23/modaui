import { Product, Order, Customer, Discount } from "./types"

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "PROD-001",
    name: "高级真皮手提包",
    sku: "LUX-BAG-001",
    price: 2580,
    stock: 15,
    status: "active",
    category: "包袋",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
    description: "选用顶级意大利牛皮，由资深工匠纯手工打造。"
  },
  {
    id: "PROD-002",
    name: "极简主义羊绒衫",
    sku: "MIN-SWE-002",
    price: 1280,
    stock: 45,
    status: "active",
    category: "上装",
    image: "https://images.unsplash.com/photo-1576566582419-173842b07459?q=80&w=1000&auto=format&fit=crop",
    description: "100% 纯羊绒材质，轻盈保暖，触感如云朵般柔软。"
  },
  {
    id: "PROD-003",
    name: "复古金边太阳镜",
    sku: "VIN-SUN-003",
    price: 880,
    stock: 120,
    status: "active",
    category: "配饰",
    image: "https://images.unsplash.com/photo-1511499767390-91f197030007?q=80&w=1000&auto=format&fit=crop",
    description: "复古设计结合现代工艺，防紫外线涂层保护眼睛。"
  }
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-20240501",
    customer: "张伟",
    email: "zhang.wei@email.com",
    total: 3860,
    status: "delivered",
    items: 2,
    date: "2024-05-01"
  },
  {
    id: "ORD-20240502",
    customer: "李娜",
    email: "li.na@email.com",
    total: 1280,
    status: "processing",
    items: 1,
    date: "2024-05-02"
  },
  {
    id: "ORD-20240503",
    customer: "王芳",
    email: "wang.fang@email.com",
    total: 880,
    status: "pending",
    items: 1,
    date: "2024-05-03"
  }
]

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CUS-001",
    name: "张伟",
    email: "zhang.wei@email.com",
    orders: 12,
    spent: 25680,
    lastOrder: "2024-05-01",
    status: "active"
  },
  {
    id: "CUS-002",
    name: "李娜",
    email: "li.na@email.com",
    orders: 8,
    spent: 12450,
    lastOrder: "2024-05-02",
    status: "active"
  },
  {
    id: "CUS-003",
    name: "王芳",
    email: "wang.fang@email.com",
    orders: 23,
    spent: 45890,
    lastOrder: "2024-05-03",
    status: "active"
  }
]

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: "DSC-001",
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    usageCount: 156,
    usageLimit: 500,
    status: "active",
    startDate: "2024-05-01",
    endDate: "2024-08-31"
  },
  {
    id: "DSC-002",
    code: "WELCOME100",
    type: "fixed",
    value: 100,
    usageCount: 89,
    usageLimit: 200,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  }
]
