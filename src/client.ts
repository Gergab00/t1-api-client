import type { EnvConfig } from "./config/env.config.js";
import { loadEnvConfig } from "./config/env.config.js";
import { AuthService } from "./auth/auth.service.js";

export interface T1ApiClientOptions {
  envConfig?: EnvConfig; // para tests/overrides
}

export class T1ApiClient {
  private readonly cfg: EnvConfig;
  private readonly auth: AuthService;

  constructor(opts: T1ApiClientOptions = {}) {
    this.cfg = opts.envConfig ?? loadEnvConfig();
    this.auth = new AuthService(this.cfg);
  }

  // Hola mundo enriquecido (sin secretos)
  hello(name: string = "world"): string {
    const maskedUser =
      this.cfg.T1_USERNAME.length > 4
        ? this.cfg.T1_USERNAME.slice(0, 2) + "***" + this.cfg.T1_USERNAME.slice(-2)
        : "***";

    return [
      `t1-api-client says: hello, ${name}!`,
      `baseUrl=${this.cfg.T1_BASE_URL}`,
      `authUrl=${this.cfg.T1_AUTH_URL}`,
      `clientId=${this.cfg.T1_CLIENT_ID}`,
      `commerceId=${this.cfg.T1_COMMERCE_ID}`,
      `timeoutMs=${this.cfg.T1_TIMEOUT_MS}`,
      `user=${maskedUser}`
    ].join(" | ");
  }

  /**
   * Expone el access_token válido (gestiona refresh internamente).
   */
  async getToken(): Promise<string> {
    return this.auth.getAccessToken();
  }

  /**
   * Ping simulado con config no sensible.
   */
  async ping(): Promise<{
    ok: true; baseUrl: string; commerceId: string; timeoutMs: number;
  }> {
    return {
      ok: true,
      baseUrl: this.cfg.T1_BASE_URL,
      commerceId: this.cfg.T1_COMMERCE_ID,
      timeoutMs: this.cfg.T1_TIMEOUT_MS
    };
  }
}
