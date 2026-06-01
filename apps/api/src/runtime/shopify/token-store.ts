import * as fs from 'fs';
import * as path from 'path';

interface ShopifyToken {
  accessToken: string;
  scope: string;
  associated_user_scope?: string;
  expires_in?: number;
}

const STORAGE_PATH = path.join(process.cwd(), '.shopify-tokens.json');

/**
 * Simple file-based token store for development
 */
export class TokenStore {
  private tokens: Record<string, ShopifyToken> = {};

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(STORAGE_PATH)) {
      try {
        this.tokens = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf-8'));
      } catch (e) {
        console.error('[TokenStore] Failed to load tokens:', e);
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.tokens, null, 2));
    } catch (e) {
      console.error('[TokenStore] Failed to save tokens:', e);
    }
  }

  set(shop: string, token: ShopifyToken) {
    this.tokens[shop] = token;
    this.save();
  }

  get(shop: string): ShopifyToken | undefined {
    return this.tokens[shop];
  }
}

export const tokenStore = new TokenStore();
