import { GoogleGenAI } from "@google/genai"

interface APIKeyManagerConfig {
  keys: string[]
  strategy?: "round-robin" | "random" | "fallback"
}

class APIKeyManager {
  private keys: string[]
  private strategy: "round-robin" | "random" | "fallback"
  private currentIndex: number
  private clients: Map<string, GoogleGenAI>
  private failedKeys: Set<string>
  private cooldownPeriod: number

  constructor(config: APIKeyManagerConfig) {
    this.keys = config.keys
    this.strategy = config.strategy || "round-robin"
    this.currentIndex = 0
    this.clients = new Map()
    this.failedKeys = new Set()
    this.cooldownPeriod = 60000

    for (const key of this.keys) {
      this.clients.set(key, this.createClient(key))
    }
  }

  private createClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  }

  private getAvailableKeys(): string[] {
    return this.keys.filter((key) => !this.failedKeys.has(key))
  }

  private markKeyAsFailed(key: string) {
    this.failedKeys.add(key)
    setTimeout(() => {
      this.failedKeys.delete(key)
    }, this.cooldownPeriod)
  }

  private getNextKeyRoundRobin(): string | null {
    const available = this.getAvailableKeys()
    if (available.length === 0) return null

    let attempts = 0
    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex]
      this.currentIndex = (this.currentIndex + 1) % this.keys.length

      if (!this.failedKeys.has(key)) {
        return key
      }
      attempts++
    }

    return null
  }

  private getNextKeyRandom(): string | null {
    const available = this.getAvailableKeys()
    if (available.length === 0) return null

    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  private getNextKeyFallback(): string | null {
    const available = this.getAvailableKeys()
    return available[0] || null
  }

  private getNextKey(): string | null {
    switch (this.strategy) {
      case "round-robin":
        return this.getNextKeyRoundRobin()
      case "random":
        return this.getNextKeyRandom()
      case "fallback":
        return this.getNextKeyFallback()
      default:
        return this.getNextKeyRoundRobin()
    }
  }

  getClient(): GoogleGenAI | null {
    const key = this.getNextKey()
    if (!key) return null
    return this.clients.get(key) || null
  }

  async withClient<T>(fn: (client: GoogleGenAI, key: string) => Promise<T>): Promise<T> {
    let lastError: Error | null = null

    for (const key of this.keys) {
      if (this.failedKeys.has(key)) continue

      const client = this.clients.get(key)
      if (!client) continue

      try {
        const result = await fn(client, key)
        return result
      } catch (error) {
        console.warn(`API key failed: ${key.slice(0, 10)}...`, error)
        this.markKeyAsFailed(key)
        lastError = error as Error
      }
    }

    throw lastError || new Error("All API keys failed")
  }

  getStats() {
    return {
      total: this.keys.length,
      available: this.getAvailableKeys().length,
      failed: this.failedKeys.size,
      failedKeys: Array.from(this.failedKeys).map((key) => key.slice(0, 10) + "...")
    }
  }
}

let apiKeyManager: APIKeyManager | null = null

export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManager) {
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ""
    const keys = keysString
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    if (keys.length === 0) {
      throw new Error("No API keys configured. Please set GEMINI_API_KEY or GEMINI_API_KEYS environment variable")
    }

    const strategy = (process.env.API_KEY_STRATEGY as any) || "round-robin"

    apiKeyManager = new APIKeyManager({
      keys,
      strategy: ["round-robin", "random", "fallback"].includes(strategy)
        ? strategy
        : "round-robin",
    })
  }
  return apiKeyManager
}

export function hasAPIKeysConfigured(): boolean {
  try {
    const manager = getAPIKeyManager()
    return manager.getStats().available > 0
  } catch {
    return false
  }
}
