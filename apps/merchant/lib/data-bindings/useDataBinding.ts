'use client'

import { useState, useEffect } from 'react'
import { DataBinding, Product, Collection } from '../theme-runtime/types'
import BindingResolver from './bindingResolver'

/**
 * Hook: 用于根据 binding 配置自动获取数据
 */
export function useDataBinding(
  binding: DataBinding | undefined,
  storeId: string,
  token?: string
) {
  const [data, setData] = useState<Product[] | Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!binding) {
      setData([])
      return
    }

    const resolver = new BindingResolver(storeId, '/api', token)

    setLoading(true)
    setError(null)

    resolver
      .resolveBinding(binding)
      .then(result => {
        setData(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err?.message || 'Failed to resolve binding')
        setLoading(false)
      })
  }, [binding, storeId, token])

  return { data, loading, error }
}

export default useDataBinding
