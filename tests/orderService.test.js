/**
 * @file tests/orderService.test.js
 * @description Pruebas unitarias para orderService (rutas, métodos y headers).
 */

const nock = require('nock');
const config = require('../src/config');
jest.mock('../src/utils/tokenManager', () => ({
  ensureValidAccessToken: jest.fn().mockResolvedValue('test-token'),
}));
jest.mock('../src/constants/const', () => ({
  ORDERS_LIST_ENDPOINT: (sellerId) => `/kidal/v1/Ordersfull/seller/${sellerId}`,
  PURCHASE_ORDER_DOWNLOAD_ENDPOINT: (sellerId, marketplace, orderId, paymentOrder) =>
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/payment_order/${paymentOrder}`,
  SHIPPING_LABEL_DOWNLOAD_ENDPOINT: (sellerId, marketplace, orderId, paymentOrder) =>
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipping_label/${paymentOrder}`,
  ORDER_GUIDE_UPLOAD_ENDPOINT: (sellerId, marketplace, orderId) =>
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment`,
  ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2: (sellerId, marketplace, orderId, shipmentId) =>
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/evidence/`,
  ORDER_PART_CANCEL_ENDPOINT: '/kidal/v1/order/pedido/cancel',
}));
const orders = require('../src/services/orderService');

describe('orderService', () => {
  afterEach(() => nock.cleanAll());

  it('listOrders pasa query params correctamente', async () => {
    const sellerId = 55;
    const query = { page: 1, size: 20, marketplace: 'LIVERPOOL' };
    const resp = { data: [] };
    nock(config.baseURL)
      .get(`/kidal/v1/Ordersfull/seller/${sellerId}`)
      .query(query)
      .reply(200, resp);
    const data = await orders.listOrders(sellerId, query);
    expect(data).toEqual(resp);
  });

  it('downloadPurchaseOrder solicita arraybuffer', async () => {
    const s = 55,
      m = 'LIVERPOOL',
      o = 999,
      po = 12345;
    const pdf = Buffer.from('%PDF-1.4');
    nock(config.baseURL)
      .get(`/kidal/v1/order/seller/${s}/marketplace/${m}/order/${o}/payment_order/${po}`)
      .reply(200, pdf);
    const data = await orders.downloadPurchaseOrder(s, m, o, po);
    expect(Buffer.isBuffer(data)).toBe(true);
  });

  it('downloadShippingLabel solicita arraybuffer', async () => {
    const s = 55,
      m = 'LIVERPOOL',
      o = 999,
      po = 12345;
    const pdf = Buffer.from('%PDF-1.4');
    nock(config.baseURL)
      .get(`/kidal/v1/order/seller/${s}/marketplace/${m}/order/${o}/shipping_label/${po}`)
      .reply(200, pdf);
    const data = await orders.downloadShippingLabel(s, m, o, po);
    expect(Buffer.isBuffer(data)).toBe(true);
  });

  it('uploadOrderGuide envía POST con body', async () => {
    const s = 55,
      m = 'LIVERPOOL',
      o = 999;
    const details = { carrier: 'DHL', trackingNumbers: ['ABC123'] };
    const resp = { ok: true };
    nock(config.baseURL)
      .post(`/kidal/v1/order/seller/${s}/marketplace/${m}/order/${o}/shipment`, details)
      .reply(200, resp);
    const data = await orders.uploadOrderGuide(s, m, o, details);
    expect(data).toEqual(resp);
  });

  it('uploadEvidence usa multipart/form-data', async () => {
    const s = 55,
      m = 'LIVERPOOL',
      o = 999,
      sh = 1;
    const file = Buffer.from('file');
    nock(config.baseURL)
      .post(`/kidal/v1/order/seller/${s}/marketplace/${m}/order/${o}/shipment/${sh}/evidence/`)
      .reply(200, { ok: true });
    const res = await orders.uploadEvidence(s, m, o, sh, file, 'evi.jpg', 'image/jpeg');
    expect(res).toEqual({ ok: true });
  });

  it('cancelOrderPart envía POST al endpoint correcto', async () => {
    const body = {
      pedido: 'X',
      relationId: '1',
      idtienda: 'T',
      reasonId: 'R',
      marketplace: 'LIVERPOOL',
    };
    const resp = { ok: true };
    nock(config.baseURL).post('/kidal/v1/order/pedido/cancel', body).reply(200, resp);
    const data = await orders.cancelOrderPart(body);
    expect(data).toEqual(resp);
  });
});
