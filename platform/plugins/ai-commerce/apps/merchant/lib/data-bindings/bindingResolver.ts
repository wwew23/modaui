import { DataBinding, Product, Collection } from '../theme-runtime/types'

/**
 * 绑定解析器：根据 binding 配置从 API 获取数据
 */
export class BindingResolver {
  private storeId: string
  private apiBase: string
  private token?: string

  constructor(storeId: string, apiBase: string = '/api', token?: string) {
    this.storeId = storeId
    this.apiBase = apiBase
    this.token = token
  }

  /**
   * 解析绑定并获取数据
   */
  async resolveBinding(binding: DataBinding | undefined): Promise<Product[] | Collection[]> {
    if (!binding) return []

    try {
      if (binding.source === 'collection') {
        // 获取集合内的产品
        const collectionId = binding.collection_id
        if (!collectionId) return []
        return await this.getCollectionProducts(collectionId)
      } else if (binding.source === 'all') {
        // 获取所有集合
        return await this.getAllCollections()
      } else if (binding.source === 'manual' && binding.ids) {
        // 手动指定的产品 ID
        return await this.getProductsByIds(binding.ids)
      }
    } catch (err) {
      console.error('Binding resolution error:', err)
    }

    return []
  }

  /**
   * 获取集合内的产品
   */
  private async getCollectionProducts(collectionId: string): Promise<Product[]> {
    const url = `${this.apiBase}/collections/${collectionId}/products?store_id=${this.storeId}`
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Failed to fetch collection products: ${res.statusText}`)
    return await res.json()
  }

  /**
   * 获取所有集合
   */
  private async getAllCollections(): Promise<Collection[]> {
    const url = `${this.apiBase}/collections?store_id=${this.storeId}`
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Failed to fetch collections: ${res.statusText}`)
    return await res.json()
  }

  /**
   * 根据 ID 列表获取产品
   */
  private async getProductsByIds(ids: string[]): Promise<Product[]> {
    const url = `${this.apiBase}/products?store_id=${this.storeId}&ids=${ids.join(',')}`
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {}
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`)
    return await res.json()
  }
}

export default BindingResolver
