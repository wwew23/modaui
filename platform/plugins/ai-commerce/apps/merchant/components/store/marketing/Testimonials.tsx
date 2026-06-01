"use client"

export interface Testimonial {
  id?: string
  name: string
  avatar?: string
  role?: string
  content: string
  rating?: number
}

export interface TestimonialsProps {
  title: string
  subtitle?: string
  testimonials: Testimonial[]
}

export function Testimonials({ 
  title, 
  subtitle, 
  testimonials = [] 
}: TestimonialsProps) {
  const safeTestimonials = testimonials || []
  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeTestimonials.map((testimonial, index) => (
            <div key={testimonial.id || index} className="p-6 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                {testimonial.avatar ? (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  {testimonial.role && <div className="text-sm text-muted-foreground">{testimonial.role}</div>}
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
              {testimonial.rating && (
                <div className="mt-4 text-yellow-500">
                  {"⭐".repeat(Math.min(testimonial.rating, 5))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const schema = {
  name: "Testimonials",
  category: "marketing",
  description: "用户评价展示组件",
  props: {
    title: "string",
    subtitle: "string",
    testimonials: "array"
  }
}

export const defaultProps: TestimonialsProps = {
  title: "用户好评",
  subtitle: "听听他们怎么说",
  testimonials: [
    { name: "张三", role: "忠实客户", content: "产品质量很好，物流也很快，非常满意！", rating: 5 },
    { name: "李四", role: "新用户", content: "第一次购买，体验很棒，下次还会再来。", rating: 5 },
    { name: "王五", role: "老顾客", content: "已经回购多次了，品质一如既往的好。", rating: 4 }
  ]
}
