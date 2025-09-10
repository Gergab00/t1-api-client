/**
 * @file tests/productService.test.js
 * @description Pruebas unitarias para el servicio de productos. Se utiliza
 * la biblioteca Nock para interceptar y simular las solicitudes HTTP
 * emitidas por el cliente. Cada prueba valida que la función
 * correspondiente construya correctamente la ruta, utilice el método
 * HTTP adecuado y devuelva los datos esperados. Esto garantiza que
 * cualquier cambio en los endpoints o en la forma de invocar el API
 * sea detectado durante la fase de pruebas.
 */

const nock = require('nock');
const config = require('../src/config');
// Mock de tokenManager para evitar llamadas reales de autenticación
jest.mock('../src/utils/tokenManager', () => ({
  ensureValidAccessToken: jest.fn().mockResolvedValue('test-token'),
}));
jest.mock('../src/constants/const', () => ({
  PRODUCT_COLLECTION_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/product`,
  PRODUCT_ITEM_ENDPOINT: (commerceId, productId) => `/cm/v2/product/commerce/${commerceId}/product/${productId}`,
  PRODUCT_PAUSE_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/pause/`,
  PRODUCT_ACTIVATE_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/active/`,
  PRODUCT_SKUS_ENDPOINT: (commerceId, productId) => `/cm/v2/product/commerce/${commerceId}/product/${productId}/sku`,
  PRODUCT_WEBHOOK_EDIT_ENDPOINT: (commerceId) => `/cm/v2/product/webhook/commerce/${commerceId}/product/edit`,
}));
const products = require('../src/services/productService');

// Datos comunes de prueba
const commerceId = 123;
const productId = 456;

describe('productService', () => {
  // Limpia todas las interceptaciones después de cada prueba
  afterEach(() => {
    nock.cleanAll();
  });

  it('debería crear un producto mediante POST', async () => {
    const fakeResponse = { id: 'PROD01', name: 'Producto prueba' };
    nock(config.baseURL)
      .post(`/cm/v2/product/commerce/${commerceId}/product`)
      .reply(201, fakeResponse);
    const data = await products.createProduct(commerceId, { name: 'Producto prueba' });
    expect(data).toEqual(fakeResponse);
  });

  it('debería listar productos con parámetros de consulta', async () => {
    const fakeResponse = { data: [] };
    const query = { page: 2, page_size: 5 };
    nock(config.baseURL)
      .get(`/cm/v2/product/commerce/${commerceId}/product`)
      .query(query)
      .reply(200, fakeResponse);
    const data = await products.listProducts(commerceId, query);
    expect(data).toEqual(fakeResponse);
  });

  it('debería actualizar un producto mediante PATCH', async () => {
    const patch = { name: 'Nuevo nombre' };
    const fakeResponse = { id: productId, name: 'Nuevo nombre' };
    nock(config.baseURL)
      .patch(`/cm/v2/product/commerce/${commerceId}/product/${productId}`, patch)
      // comprueba que el encabezado Content-Type esté presente
      .matchHeader('Content-Type', 'application/merge-patch+json')
      .reply(200, fakeResponse);
    const data = await products.updateProduct(commerceId, productId, patch);
    expect(data).toEqual(fakeResponse);
  });

  it('debería obtener información de un producto mediante GET', async () => {
    const fakeResponse = { id: productId, name: 'Producto X' };
    nock(config.baseURL)
      .get(`/cm/v2/product/commerce/${commerceId}/product/${productId}`)
      .reply(200, fakeResponse);
    const data = await products.getProduct(commerceId, productId);
    expect(data).toEqual(fakeResponse);
  });

  it('debería eliminar un producto mediante DELETE', async () => {
    const fakeResponse = { metadata: { status: 'success' } };
    nock(config.baseURL)
      .delete(`/cm/v2/product/commerce/${commerceId}/product/${productId}`)
      .reply(200, fakeResponse);
    const data = await products.deleteProduct(commerceId, productId);
    expect(data).toEqual(fakeResponse);
  });

  it('debería pausar productos mediante POST', async () => {
    const ids = ['PROD01', 'PROD02'];
    const channels = ['CS'];
    const fakeResponse = { metadata: { status: 'success' } };
    nock(config.baseURL)
      .post(`/cm/v2/product/commerce/${commerceId}/pause/`, { ids, salesChannels: channels })
      .reply(200, fakeResponse);
    const data = await products.pauseProducts(commerceId, ids, channels);
    expect(data).toEqual(fakeResponse);
  });

  it('debería activar productos mediante POST', async () => {
    const ids = ['PROD01'];
    const channels = ['CS', 'SR'];
    const fakeResponse = { metadata: { status: 'success' } };
    nock(config.baseURL)
      .post(`/cm/v2/product/commerce/${commerceId}/active/`, { ids, salesChannels: channels })
      .reply(200, fakeResponse);
    const data = await products.activateProducts(commerceId, ids, channels);
    expect(data).toEqual(fakeResponse);
  });

  it('debería listar variaciones (SKUs) mediante GET', async () => {
    const fakeResponse = { data: [] };
    nock(config.baseURL)
      .get(`/cm/v2/product/commerce/${commerceId}/product/${productId}/sku`)
      .reply(200, fakeResponse);
    const data = await products.listSkus(commerceId, productId);
    expect(data).toEqual(fakeResponse);
  });
});