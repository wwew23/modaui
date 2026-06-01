/**
 * Component Detection Patterns
 * Regex patterns to identify common sections/components
 */

module.exports = {
  Hero: /(?:<section|<div)[\s\S]*?(?:hero|banner|jumbotron)/i,
  ProductGrid: /(?:product.*grid|grid.*product|shop.*grid|products.*container)/i,
  ProductCard: /(?:product.*card|card.*product)/i,
  Gallery: /(?:<gallery|gallery.*container|lightbox|carousel.*image|image.*carousel)/i,
  Testimonials: /(?:testimonial|review|quote|feedback)/i,
  FAQ: /(?:faq|frequently.*asked|question.*answer)/i,
  Footer: /(?:<footer|footer.*section)/i,
  Navbar: /(?:nav|header|top.*bar|navigation)/i,
  Button: /(?:<button|btn|action|cta)/i,
  Card: /(?:<.*card|\.card)/i,
  Image: /(?:<img|image.*container|picture)/i,
  Text: /(?:<p|paragraph|heading|title)/i
}
