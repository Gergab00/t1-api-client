import type { EnvConfig } from "../config/env.config.js";
import type { TokenEndpointResponse } from "../types/auth.types.js";
import type { TokenStore, TokenSet } from "./token.store.js";
import { MemoryTokenStore } from "./token.store.js";

/**
 * SRP: Manejo de autenticación con Keycloak (password grant).
 * - Obtiene y refresca el access_token.
 * - Cache en memoria mediante TokenStore.
 */
export class AuthService {
  private readonly cfg: EnvConfig;
  private readonly store: TokenStore;

  constructor(cfg: EnvConfig, store: TokenStore = new MemoryTokenStore()) {
    this.cfg = cfg;
    this.store = store;
  }

  /**
   * Devuelve un access_token válido.
   * - Si está presente y no está por expirar, reutiliza.
   * - Si expira pronto, intenta refresh si hay refresh_token.
   * - Si no hay nada, realiza password grant.
   */
  async getAccessToken(): Promise<string> {
    const cached = await this.store.load();
    const now = Date.now();

    if (cached && (cached.expiresAt - now) > this.cfg.T1_REFRESH_MARGIN_SEC * 1000) {
      return cached.accessToken;
    }

    if (cached?.refreshToken) {
      try {
        const refreshed = await this.refresh(cached.refreshToken);
        await this.store.save(refreshed);
        return refreshed.accessToken;
      } catch {
        // Fallback a password grant si el refresh falla
      }
    }

    const fresh = await this.passwordGrant();
    await this.store.save(fresh);
    return fresh.accessToken;
  }

  /**
   * grant_type=password
   */
  private async passwordGrant(): Promise<TokenSet> {
    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("client_id", this.cfg.T1_CLIENT_ID);
    form.set("username", this.cfg.T1_USERNAME);
    form.set("password", this.cfg.T1_PASSWORD);

    const res = await fetch(this.cfg.T1_AUTH_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/json",
        "user-agent": this.cfg.T1_USER_AGENT
      },
      body: form.toString()
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Auth password grant failed: ${res.status} ${text}`);
    }

    const data = await res.json() as TokenEndpointResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    };
  }

  /**
   * grant_type=refresh_token
   */
  private async refresh(refreshToken: string): Promise<TokenSet> {
    const form = new URLSearchParams();
    form.set("grant_type", "refresh_token");
    form.set("client_id", this.cfg.T1_CLIENT_ID);
    form.set("refresh_token", refreshToken);

    const res = await fetch(this.cfg.T1_AUTH_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/json",
        "user-agent": this.cfg.T1_USER_AGENT
      },
      body: form.toString()
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Auth refresh failed: ${res.status} ${text}`);
    }

    const data = await res.json() as TokenEndpointResponse;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000)
    };
  }
}