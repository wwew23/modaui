import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from './input'
import { Textarea } from './textarea'

export interface AIInlineAutocompleteProps {
  id: string
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  helperText?: string
  as?: 'input' | 'textarea'
  rows?: number
  className?: string
  disabled?: boolean
}

const suggestionCatalog: Record<string, string> = {
  'meta-title': '极简科技体验旗舰店 - 纯粹声音，触手可及',
  'meta-description': '采用自研旗舰级声学引擎，定制您的专属静谧音舱。探索高品质音频产品的极致体验。',
  'social-title': '极简科技体验旗舰店',
  'social-description': '探索高品质音频产品的极致体验，打造沉浸式听觉空间。',
  'store-name': 'AeroTech 极简旗舰店',
  'store-description': '这是一家专注于极简科技风、静谧体验的高端电商旗舰店。',
  'gmail-subject': '您的订单已发货通知',
  'gmail-body': '您好，您的订单已于今日发货，物流单号为：xxxx。若有问题请随时联系。',
  'note-title': '运营灵感：夏季促销主题',
  'note-content': '规划一场“极简静音体验”主题活动，突出舒适与高端质感。',
  'ai-prompt': '一个极简风格的智能电子产品商店',
  'content-prompt': '智能降噪耳机，磨砂黑配色，主打都市白领静谧体验',
  'product-name': '极简风运动鞋',
  'nav-item-name': '新品推荐',
  'default-title': '极简风运动鞋商品页面',
  'default-description': '轻奢简约，专为现代城市运动生活设计。',
}

function getAISuggestion(value: string, fieldId: string): string {
  const trimmed = value.trim()
  const key = fieldId.toLowerCase()
  const fieldSuggestion = suggestionCatalog[key] || suggestionCatalog['default-description']

  if (!trimmed) {
    return fieldSuggestion
  }

  if (key.includes('subject')) {
    return fieldSuggestion
  }

  if (key.includes('body') || key.includes('content') || key.includes('description') || key.includes('note')) {
    if (trimmed.includes('静谧')) {
      return '我们主打静谧与极简风格，强调高端音质与都市舒适体验。'
    }
    if (trimmed.includes('运动')) {
      return '轻奢简约设计，兼具舒适与时尚，适合全天候运动穿搭。'
    }
    if (trimmed.length < 20) {
      return `${trimmed}，为您的品牌提供更高曝光与转化。`
    }
    return `${trimmed}，让您的内容更具吸引力和转化力。`
  }

  if (key.includes('title') || key.includes('name') || key.includes('prompt')) {
    if (trimmed.includes('黑色')) {
      return '黑色极简风运动鞋商品页面'
    }
    if (trimmed.includes('极简')) {
      return '极简风运动鞋商品页面'
    }
    if (trimmed.length < 12) {
      return `${trimmed} - 极简风运动鞋商品页面`
    }
    return `${trimmed}，打造现代都市轻奢风格`
  }

  return fieldSuggestion
}

export function AIInlineAutocomplete({
  id,
  value,
  onChange,
  label,
  placeholder,
  helperText,
  as = 'input',
  rows = 4,
  className,
  disabled,
}: AIInlineAutocompleteProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const suggestion = React.useMemo(() => getAISuggestion(value, id), [value, id])
  const suggestionTail = React.useMemo(() => {
    if (!suggestion) return ''
    if (!value) return suggestion
    return suggestion.toLowerCase().startsWith(value.toLowerCase())
      ? suggestion.slice(value.length)
      : suggestion
  }, [suggestion, value])

  const commitSuggestion = React.useCallback(() => {
    if (!suggestionTail) return
    onChange(value + suggestionTail)
  }, [onChange, suggestionTail, value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Tab' && suggestionTail) {
      event.preventDefault()
      commitSuggestion()
    }
  }

  const sharedProps = {
    id,
    value,
    placeholder,
    disabled,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onKeyDown: handleKeyDown,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    className: cn('bg-transparent', className),
  }

  return (
    <div className={cn('space-y-2', disabled && 'opacity-70') }>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={cn(
            'pointer-events-none absolute inset-0 overflow-hidden rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-opacity',
            as === 'textarea' ? 'whitespace-pre-wrap break-words' : 'whitespace-nowrap overflow-hidden',
            (!isFocused || !suggestionTail) && 'opacity-0'
          )}
        >
          <span className="text-transparent">{value || placeholder || ''}</span>
          <span>{suggestionTail}</span>
        </div>

        {as === 'textarea' ? (
          <Textarea {...sharedProps} rows={rows} />
        ) : (
          <Input {...sharedProps as React.ComponentProps<'input'>} type="text" />
        )}
      </div>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : suggestionTail ? (
        <p className="text-xs text-muted-foreground">按 <span className="font-medium">Tab</span> 直接补全建议</p>
      ) : null}
    </div>
  )
}
