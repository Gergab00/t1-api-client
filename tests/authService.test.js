/**
 * @file tests/authService.test.js
 * @description Pruebas unitarias para el servicio de autenticación.
 * Utiliza Nock para interceptar las solicitudes HTTP y simular
 * la respuesta del servidor de autenticación de T1.
 */

const nock = require('nock');
const config = require('../src/config');
// Mock del endpoint absoluto de auth para apuntar al baseURL durante pruebas
jest.mock('../src/constants/const', () => ({
  AUTH_TOKEN_ENDPOINT: `${require('../src/config').baseURL}/auth/realms/plataforma-claro/protocol/openid-connect/token`,
}));
const { login } = require('../src/services/authService');

describe('authService', () => {
  afterEach(() => {
    nock.cleanAll();
    config.accessToken = undefined;
  });

  it('debería obtener y asignar un token de acceso', async () => {
    // Definir respuesta simulada
    const fakeResponse = { access_token: 'token-de-prueba' };
    // Interceptar la solicitud
    nock(config.baseURL)
      .post('/auth/realms/plataforma-claro/protocol/openid-connect/token')
      .reply(200, fakeResponse);
    const token = await login();
    expect(token).toBe(fakeResponse.access_token);
    expect(config.accessToken).toBe(fakeResponse.access_token);
  });
});
