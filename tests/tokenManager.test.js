/**
 * @file tests/tokenManager.test.js
 * @description Pruebas unitarias para tokenManager (isTokenValid, single-flight, fallback login/refresh).
 */

const config = require('../src/config');

jest.mock('../src/services/authService', () => ({
  login: jest.fn().mockResolvedValue('login-token'),
  refresh: jest.fn().mockResolvedValue('refresh-token'),
}));

const { login, refresh } = require('../src/services/authService');
const { ensureValidAccessToken, isTokenValid } = require('../src/utils/tokenManager');

describe('tokenManager', () => {
  beforeEach(() => {
    config.accessToken = null;
    config.refreshToken = null;
    config.expiresAt = 0;
    jest.clearAllMocks();
  });

  it('isTokenValid retorna true solo si hay accessToken y no expiró', () => {
    config.accessToken = 'x';
    config.expiresAt = Date.now() + 10_000;
    expect(isTokenValid()).toBe(true);
    config.expiresAt = Date.now() - 1;
    expect(isTokenValid()).toBe(false);
  });

  it('usa refresh cuando hay refreshToken y expiró', async () => {
    config.refreshToken = 'rt';
    config.accessToken = 'old';
    config.expiresAt = Date.now() - 1;

    const token = await ensureValidAccessToken();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(token).toBe('refresh-token');
  });

  it('hace fallback a login cuando no hay refreshToken', async () => {
    config.refreshToken = null;
    config.accessToken = null;
    config.expiresAt = 0;

    const token = await ensureValidAccessToken();
    expect(login).toHaveBeenCalledTimes(1);
    expect(token).toBe('login-token');
  });

  it('single-flight: múltiples llamadas concurrentes comparten la misma promesa', async () => {
    // Simula refresh lento con única resolución
    let resolver;
    refresh.mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolver = res;
        }),
    );

    config.refreshToken = 'rt';
    config.accessToken = 'old';
    config.expiresAt = Date.now() - 1;

    const p1 = ensureValidAccessToken();
    const p2 = ensureValidAccessToken();

    // Resuelve ambas a la vez
    resolver('refresh-token-2');

    await expect(p1).resolves.toBe('refresh-token-2');
    await expect(p2).resolves.toBe('refresh-token-2');
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
