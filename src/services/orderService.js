/**
 * @file src/services/orderService.js
 * @description Servicio que engloba operaciones sobre pedidos: consulta,
 * descarga de órdenes de compra y etiquetas de envío, carga de guías
 * manuales, subida de evidencias de entrega y cancelación de partidas.
 */

const httpClient = require('../utils/httpClient');
const FormData = require('form-data');

/**
 * Lista los pedidos completos (Ordersfull) de un vendedor. Se pueden
 * especificar filtros de búsqueda como fechas, estados, marketplace, etc.
 *
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {Object} [query={}] Parámetros de consulta (página, filtros).
 * @returns {Promise<Object[]>} Lista de pedidos con sus partidas.
 */
function listOrders(sellerId, query = {}) {
  return httpClient.get(`/kidal/v1/Ordersfull/seller/${sellerId}`, { params: query });
}

/**
 * Descarga la orden de compra en formato PDF para un pedido específico.
 *
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Plataforma de marketplace (p. ej. 'LIVERPOOL').
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} paymentOrder Identificador de la orden de pago.
 * @returns {Promise<Buffer>} Contenido del PDF en un buffer.
 */
function downloadPurchaseOrder(sellerId, marketplace, orderId, paymentOrder) {
  return httpClient.get(
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/payment_order/${paymentOrder}`,
    { responseType: 'arraybuffer' }
  );
}

/**
 * Descarga la etiqueta de envío en formato PDF de un pedido.
 *
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Plataforma de marketplace.
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} paymentOrder Identificador de la orden de pago.
 * @returns {Promise<Buffer>} Contenido de la etiqueta en PDF.
 */
function downloadShippingLabel(sellerId, marketplace, orderId, paymentOrder) {
  return httpClient.get(
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipping_label/${paymentOrder}`,
    { responseType: 'arraybuffer' }
  );
}

/**
 * Sube la guía de envío manual para un pedido. El cuerpo debe incluir
 * información de la guía, como el carrier y los números de seguimiento.
 *
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Marketplace asociado.
 * @param {string|number} orderId Identificador del pedido.
 * @param {Object} details Datos de la guía (kind, carrier, trackingNumbers, etc.).
 * @returns {Promise<Object>} Respuesta de la API.
 */
function uploadOrderGuide(sellerId, marketplace, orderId, details) {
  return httpClient.post(
    `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment`,
    details
  );
}

/**
 * Sube la evidencia de entrega de un envío manual en formato archivo.
 *
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Marketplace asociado.
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} shipmentId Identificador del envío.
 * @param {Buffer|Stream} fileBuffer Archivo de evidencia (imagen o PDF).
 * @param {string} filename Nombre del archivo.
 * @param {string} mimetype Tipo MIME del archivo.
 * @returns {Promise<Object>} Respuesta de la API.
 */
function uploadEvidence(sellerId, marketplace, orderId, shipmentId, fileBuffer, filename, mimetype) {
  const form = new FormData();
  form.append('evidencia', fileBuffer, { filename, contentType: mimetype });
  return httpClient.post(
    `/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/evidence/`,
    form,
    { headers: form.getHeaders() }
  );
}

/**
 * Cancela una partida de un pedido antes de ser enviada. Este endpoint
 * requiere un cuerpo con campos obligatorios: pedido, relationId, idtienda,
 * reasonId y marketplace.
 *
 * @param {Object} body Cuerpo de la solicitud con campos definidos por T1.
 * @returns {Promise<Object>} Respuesta de la API.
 */
function cancelOrderPart(body) {
  return httpClient.post('/kidal/v1/order/pedido/cancel', body);
}

module.exports = {
  listOrders,
  downloadPurchaseOrder,
  downloadShippingLabel,
  uploadOrderGuide,
  uploadEvidence,
  cancelOrderPart,
};