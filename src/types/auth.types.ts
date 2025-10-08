export interface TokenEndpointResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string; // "Bearer"
  expires_in: number; // en segundos
  scope?: string;
}
