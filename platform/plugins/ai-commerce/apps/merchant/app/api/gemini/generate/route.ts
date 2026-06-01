import { NextRequest, NextResponse } from "next/server"
import { getAPIKeyManager, hasAPIKeysConfigured } from "@/lib/api-key-manager"

const STORE_DSL_SCHEMA = {
  type: "object",
  properties: {
    content: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["Navbar"] },
              props: {
                type: "object",
                properties: {
                  logoText: { type: "string" },
                  links: { type: "array", items: { type: "string" } },
                  cartIcon: { type: "boolean" }
                },
                required: ["logoText"]
              }
            },
            required: ["type", "props"]
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["HeroSection"] },
              props: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  ctaText: { type: "string" },
                  background: { type: "string" }
                },
                required: ["title", "subtitle"]
              }
            },
            required: ["type", "props"]
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["FeatureSection"] },
              props: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  features: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        icon: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["title", "description"]
                    }
                  }
                },
                required: ["title", "features"]
              }
            },
            required: ["type", "props"]
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["ProductGrid"] },
              props: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  columns: { type: "number", enum: [2, 3, 4] },
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        price: { type: "string" },
                        image: { type: "string" }
                      },
                      required: ["name", "price", "image"]
                    }
                  }
                },
                required: ["title", "products"]
              }
            },
            required: ["type", "props"]
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["Testimonials"] },
              props: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  testimonials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        role: { type: "string" },
                        content: { type: "string" },
                        rating: { type: "number", minimum: 1, maximum: 5 }
                      },
                      required: ["name", "content"]
                    }
                  }
                },
                required: ["title", "testimonials"]
              }
            },
            required: ["type", "props"]
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["Footer"] },
              props: {
                type: "object",
                properties: {
                  logoText: { type: "string" },
                  copyright: { type: "string" }
                },
                required: ["logoText"]
              }
            },
            required: ["type", "props"]
          }
        ]
      }
    },
    root: {
      type: "object",
      properties: {
        props: {
          type: "object",
          properties: {
            title: { type: "string" }
          },
          required: ["title"]
        }
      },
      required: ["props"]
    }
  },
  required: ["content", "root"]
}

export async function POST(req: NextRequest) {
  try {
    if (!hasAPIKeysConfigured()) {
      return NextResponse.json(
        { error: "No API keys configured. Please set GEMINI_API_KEY or GEMINI_API_KEYS environment variable" },
        { status: 500 }
      )
    }

    const manager = getAPIKeyManager()
    const body = await req.json()
    const { prompt, type, context } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    let systemInstruction = "You are a top-tier AI Ecommerce consultant and developer. Help the user optimize, generate, or analyze their retail business."

    if (type === "store" || type === "page") {
      systemInstruction = `You are an expert Ecommerce UX designer and store builder.
Generate a complete online store using our component system.
Available components:
- Navbar: Navigation bar with logo, links, and cart icon
- HeroSection: Hero banner with title, subtitle, CTA button, and background
- FeatureSection: Feature showcase with icons, titles, and descriptions
- ProductGrid: Product display grid with product cards
- Testimonials: Customer testimonials with ratings
- Footer: Footer with links and copyright

You MUST output ONLY valid JSON following this EXACT schema:
{
  "content": [
    {
      "type": "Navbar",
      "props": {
        "logoText": "Store Name",
        "links": ["首页", "商品", "关于", "联系"],
        "cartIcon": true
      }
    },
    {
      "type": "HeroSection",
      "props": {
        "title": "Hero Title",
        "subtitle": "Hero Subtitle",
        "ctaText": "立即购买",
        "background": "#f8fafc"
      }
    },
    {
      "type": "FeatureSection",
      "props": {
        "title": "Features",
        "subtitle": "Why choose us",
        "features": [
          {"icon": "🚀", "title": "Feature 1", "description": "Description 1"}
        ]
      }
    },
    {
      "type": "ProductGrid",
      "props": {
        "title": "Products",
        "subtitle": "Our products",
        "columns": 3,
        "products": [
          {"name": "Product 1", "price": "¥99", "image": "https://picsum.photos/400/400?random=1"}
        ]
      }
    },
    {
      "type": "Testimonials",
      "props": {
        "title": "Reviews",
        "subtitle": "Customer feedback",
        "testimonials": [
          {"name": "Customer", "role": "Buyer", "content": "Great product!", "rating": 5}
        ]
      }
    },
    {
      "type": "Footer",
      "props": {
        "logoText": "Store Name",
        "copyright": "© 2026 Store Name"
      }
    }
  ],
  "root": {
    "props": {
      "title": "Store Title"
    }
  }
}

DO NOT include any text outside the JSON object. Generate content based on the user's description. Use Chinese text for Chinese users.`
    } else if (type === "copy" || type === "generate-description") {
      systemInstruction = "You are an SEO expert copywriter. Generate compelling, highly-detailed, and attractive descriptions/marketing content. Format with subtle Markdown."
    } else if (type === "optimize-pricing") {
      systemInstruction = "You are an ecommerce analyst. Analyze parameters and supply clear, professional price optimizations and competitor pricing strategies in Markdown."
    }

    const result = await manager.withClient(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })

      return response.text || "Generated output successful."
    })

    return NextResponse.json({ text: result })
  } catch (error: any) {
    console.error("Gemini API Error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate contents from AI" },
      { status: 500 }
    )
  }
}
