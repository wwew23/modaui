import { MinimalHero } from "@/components/store/hero"
import { ProductGrid } from "@/components/store/product"
import { FeatureSection, Testimonials } from "@/components/store/marketing"
import { Navbar, Footer } from "@/components/store/layout"

export const componentRegistry = {
  MinimalHero,
  ProductGrid,
  FeatureSection,
  Testimonials,
  Navbar,
  Footer
} as const

export type RegistryComponentName = keyof typeof componentRegistry

export function getComponent(name: RegistryComponentName) {
  return componentRegistry[name]
}

export function getAllComponents() {
  return componentRegistry
}

export function getComponentListForAI() {
  return Object.keys(componentRegistry)
}
