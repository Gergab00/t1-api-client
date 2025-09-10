/**
 * @file tests/index.test.js
 * @description Verifica que el index exporte los módulos públicos esperados.
 */

// Evita cargar const.ts en cascada
jest.mock('../src/constants/const', () => ({
  // Exponer solo lo mínimo requerido por los servicios importados en src/index
  AUTH_TOKEN_ENDPOINT: `${require('../src/config').baseURL}/auth/realms/plataforma-claro/protocol/openid-connect/token`,
  BRANDS_LIST_ENDPOINT: '/api-resource/api/v1/brands',
  CATEGORY_TREE_ENDPOINT: (channelId) => `/cm/v2/sales_channel/${channelId}/category/`,
  CATEGORY_DETAIL_ENDPOINT: (channelId, categoryId) => `/cm/v2/sales_channel/${channelId}/category/${categoryId}`,
  CATEGORY_MATCHES_ENDPOINT: (categoryId) => `/cm/v2/sales_channel/category/${categoryId}/matches`,
  FILE_UPLOAD_ENDPOINT: (bucket) => `/file/v1.1/${bucket}`,
  ORDERS_LIST_ENDPOINT: (sellerId) => `/kidal/v1/Ordersfull/seller/${sellerId}`,
  PURCHASE_ORDER_DOWNLOAD_ENDPOINT: (sellerId, marketplace, orderId, paymentOrder) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/payment_order/${paymentOrder}`,
  SHIPPING_LABEL_DOWNLOAD_ENDPOINT: (sellerId, marketplace, orderId, paymentOrder) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipping_label/${paymentOrder}`,
  ORDER_GUIDE_UPLOAD_ENDPOINT: (sellerId, marketplace, orderId) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment`,
  ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2: (sellerId, marketplace, orderId, shipmentId) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/evidence/`,
  ORDER_PART_CANCEL_ENDPOINT: '/kidal/v1/order/pedido/cancel',
  PRODUCT_COLLECTION_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/product`,
  PRODUCT_ITEM_ENDPOINT: (commerceId, productId) => `/cm/v2/product/commerce/${commerceId}/product/${productId}`,
  PRODUCT_PAUSE_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/pause/`,
  PRODUCT_ACTIVATE_ENDPOINT: (commerceId) => `/cm/v2/product/commerce/${commerceId}/active/`,
  PRODUCT_SKUS_ENDPOINT: (commerceId, productId) => `/cm/v2/product/commerce/${commerceId}/product/${productId}/sku`,
  PRODUCT_WEBHOOK_EDIT_ENDPOINT: (commerceId) => `/cm/v2/product/webhook/commerce/${commerceId}/product/edit`,
}));
const api = require('../src');

describe('index exports', () => {
  it('expone los namespaces esperados', () => {
    expect(api).toHaveProperty('auth');
    expect(api).toHaveProperty('products');
    expect(api).toHaveProperty('files');
    expect(api).toHaveProperty('catalogs');
    expect(api).toHaveProperty('orders');
  });
});
