/**
 * @file tests/httpClient.test.js
 * @description Pruebas para el cliente HTTP central (interceptores, normalización y retry en 401).
 */

const nock = require('nock');
const config = require('../src/config');
// Mock del tokenManager para controlar el token inyectado (definir antes de requerir httpClient)
jest.mock('../src/utils/tokenManager', () => ({
  ensureValidAccessToken: jest.fn().mockResolvedValue('test-token'),
}));
const { ensureValidAccessToken } = require('../src/utils/tokenManager');
const httpClient = require('../src/utils/httpClient');

describe('httpClient', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('inyecta Authorization y devuelve response.data', async () => {
    const payload = { ok: true };
    nock(config.baseURL)
      .get('/ping')
      .matchHeader('Authorization', 'Bearer test-token')
      .reply(200, payload);

    const data = await httpClient.get('/ping');
    expect(ensureValidAccessToken).toHaveBeenCalledTimes(1);
    expect(data).toEqual(payload);
  });

  it('normaliza errores no-401 con {status, message}', async () => {
    nock(config.baseURL).get('/notfound').reply(404, { message: 'Not Found' });

    await expect(httpClient.get('/notfound')).rejects.toEqual({
      status: 404,
      message: 'Not Found',
    });
  });

  it('ante 401 reintenta una sola vez tras renovar token', async () => {
    const path = '/secure';
    // Primera respuesta 401
    nock(config.baseURL).get(path).reply(401, { message: 'expired' });
    // Reintento exitoso con Authorization actualizado
    nock(config.baseURL)
      .get(path)
      .matchHeader('Authorization', 'Bearer test-token')
      .reply(200, { ok: true });

    const data = await httpClient.get(path);
    expect(ensureValidAccessToken).toHaveBeenCalled();
    expect(data).toEqual({ ok: true });
  });
});
