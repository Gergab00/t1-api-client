export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  // Epoch en ms cuando expira el access_token
  expiresAt: number;
}

export interface TokenStore {
  load(): Promise<TokenSet | null>;
  save(tokens: TokenSet): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Implementación en memoria (por proceso).
 * Adecuada para pruebas locales y single-instance.
 */
export class MemoryTokenStore implements TokenStore {
  private current: TokenSet | null = null;
  async load(): Promise<TokenSet | null> { return this.current; }
  async save(tokens: TokenSet): Promise<void> { this.current = tokens; }
  async clear(): Promise<void> { this.current = null; }
}
