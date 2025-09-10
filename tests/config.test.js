/**
 * @file tests/config.test.js
 * @description Pruebas unitarias para config (precedencia y mutabilidad controlada).
 */

const path = require('path');

describe('config', () => {
  // Cargamos un módulo fresco por prueba para evitar cache de require
  const freshImport = () => {
    jest.resetModules();
    process.env.T1_BASE_URL = 'https://example.test';
    process.env.T1_CLIENT_ID = 'client-x';
    process.env.T1_USERNAME = 'u';
    process.env.T1_PASSWORD = 'p';
    return require('../src/config');
  };

  afterEach(() => {
    delete process.env.T1_BASE_URL;
    delete process.env.T1_CLIENT_ID;
    delete process.env.T1_USERNAME;
    delete process.env.T1_PASSWORD;
  });

  it('usa variables de entorno con mayor precedencia', () => {
    const cfg = freshImport();
    expect(cfg.baseURL).toBe('https://example.test');
    expect(cfg.clientId).toBe('client-x');
    expect(cfg.username).toBe('u');
    expect(cfg.password).toBe('p');
  });

  it('permite mutar accessToken/refreshToken/expiresAt en memoria', () => {
    const cfg = freshImport();
    cfg.accessToken = 'a';
    cfg.refreshToken = 'r';
    cfg.expiresAt = 123;
    expect(cfg.accessToken).toBe('a');
    expect(cfg.refreshToken).toBe('r');
    expect(cfg.expiresAt).toBe(123);
  });
});
