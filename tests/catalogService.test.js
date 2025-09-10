/**
 * @file tests/catalogService.test.js
 * @description Pruebas unitarias para catalogService (rutas y métodos correctos).
 */

const nock = require('nock');
const config = require('../src/config');
jest.mock('../src/utils/tokenManager', () => ({
  ensureValidAccessToken: jest.fn().mockResolvedValue('test-token'),
}));
// Mock de constantes TS para evitar cargar const.ts
jest.mock('../src/constants/const', () => ({
  BRANDS_LIST_ENDPOINT: '/api-resource/api/v1/brands',
  CATEGORY_TREE_ENDPOINT: (channelId) => `/cm/v2/sales_channel/${channelId}/category/`,
  CATEGORY_DETAIL_ENDPOINT: (channelId, categoryId) => `/cm/v2/sales_channel/${channelId}/category/${categoryId}`,
  CATEGORY_MATCHES_ENDPOINT: (categoryId) => `/cm/v2/sales_channel/category/${categoryId}/matches`,
}));
const catalogs = require('../src/services/catalogService');

describe('catalogService', () => {
  afterEach(() => nock.cleanAll());

  it('listBrands realiza GET al endpoint correcto', async () => {
    const resp = [{ id: 1, name: 'Marca' }];
    nock(config.baseURL)
      .get('/api-resource/api/v1/brands')
      .reply(200, resp);

    const data = await catalogs.listBrands();
    expect(data).toEqual(resp);
  });

  it('getCategoryTree construye la ruta con channelId', async () => {
    const channelId = 7;
    const payload = { tree: [] };
    nock(config.baseURL)
      .get(`/cm/v2/sales_channel/${channelId}/category/`)
      .reply(200, payload);
    const data = await catalogs.getCategoryTree(channelId);
    expect(data).toEqual(payload);
  });

  it('getCategoryDetail construye la ruta con channelId y categoryId', async () => {
    const channelId = 7;
    const categoryId = 1234;
    const payload = { id: categoryId };
    nock(config.baseURL)
      .get(`/cm/v2/sales_channel/${channelId}/category/${categoryId}`)
      .reply(200, payload);
    const data = await catalogs.getCategoryDetail(channelId, categoryId);
    expect(data).toEqual(payload);
  });

  it('getCategoryMatches construye la ruta con categoryId', async () => {
    const categoryId = 11769;
    const payload = { matches: [] };
    nock(config.baseURL)
      .get(`/cm/v2/sales_channel/category/${categoryId}/matches`)
      .reply(200, payload);
    const data = await catalogs.getCategoryMatches(categoryId);
    expect(data).toEqual(payload);
  });
});
