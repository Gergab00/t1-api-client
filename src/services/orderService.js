/**
 * @file src/services/orderService.js
 * @description Servicio de pedidos: encapsula operaciones de consulta de órdenes,
 * descarga de documentos (orden de compra, etiqueta de envío), carga de guías manuales,
 * subida de evidencias de entrega y cancelación de partidas antes del despacho.
 *
 * Todas las funciones son adaptadores del `httpClient` que definen endpoint y forma del
 * payload. No incluyen lógica de negocio compleja para mantener responsabilidad única.
 */

// ANCHOR: dependencias
const httpClient = require('../utils/httpClient'); // Cliente HTTP centralizado
const FormData = require('form-data'); // Construcción de multipart/form-data para evidencias
const {
  ORDERS_LIST_ENDPOINT,
  PURCHASE_ORDER_DOWNLOAD_ENDPOINT,
  SHIPPING_LABEL_DOWNLOAD_ENDPOINT,
  ORDER_GUIDE_UPLOAD_ENDPOINT,
  ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2,
  ORDER_PART_CANCEL_ENDPOINT,
} = require('../constants/const'); // NOTE: Mantener sincronizado si cambia nomenclatura en const.

// ANCHOR: list-orders
/**
 * Lista pedidos completos (Ordersfull) de un vendedor con filtros opcionales.
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {Object} [query={}] Parámetros de consulta (fechaInicio, fechaFin, estado, marketplace, page, size, etc.).
 * @returns {Promise<Object[]>} Promesa que resuelve con la colección de pedidos.
 * @example
 * const orders = await listOrders(55, { page: 1, size: 20, marketplace: 'LIVERPOOL' });
 */
function listOrders(sellerId, query = {}) {
  // INFO: Se delega la serialización de parámetros al cliente Axios.
  return httpClient.get(ORDERS_LIST_ENDPOINT(sellerId), { params: query });
}

// ANCHOR: download-purchase-order
/**
 * Descarga la orden de compra (PDF) asociada a un pedido.
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Código del marketplace (p.ej. 'LIVERPOOL').
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} paymentOrder Identificador de la orden de pago.
 * @returns {Promise<Buffer>} Promesa con el contenido binario (arraybuffer) del PDF.
 * @example
 * const pdf = await downloadPurchaseOrder(55, 'LIVERPOOL', 999, 12345);
 */
function downloadPurchaseOrder(sellerId, marketplace, orderId, paymentOrder) {
  return httpClient.get(
    PURCHASE_ORDER_DOWNLOAD_ENDPOINT(sellerId, marketplace, orderId, paymentOrder),
    { responseType: 'arraybuffer' },
  );
}

// ANCHOR: download-shipping-label
/**
 * Descarga la etiqueta de envío (PDF) de un pedido.
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Código del marketplace.
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} paymentOrder Identificador de la orden de pago.
 * @returns {Promise<Buffer>} Promesa con el PDF como arraybuffer.
 */
function downloadShippingLabel(sellerId, marketplace, orderId, paymentOrder) {
  return httpClient.get(
    SHIPPING_LABEL_DOWNLOAD_ENDPOINT(sellerId, marketplace, orderId, paymentOrder),
    { responseType: 'arraybuffer' },
  );
}

// ANCHOR: upload-order-guide
/**
 * Sube la guía de envío manual para un pedido.
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Marketplace asociado.
 * @param {string|number} orderId Identificador del pedido.
 * @param {Object} details Datos de la guía (kind, carrier, trackingNumbers, etc.).
 * @returns {Promise<Object>} Promesa con la respuesta del backend.
 * @example
 * await uploadOrderGuide(55, 'LIVERPOOL', 999, { carrier: 'DHL', trackingNumbers: ['ABC123'] });
 */
function uploadOrderGuide(sellerId, marketplace, orderId, details) {
  return httpClient.post(ORDER_GUIDE_UPLOAD_ENDPOINT(sellerId, marketplace, orderId), details);
}

// ANCHOR: upload-evidence
/**
 * Sube evidencia de entrega (archivo) para un envío manual asociado a un pedido.
 * @param {string|number} sellerId Identificador del vendedor.
 * @param {string} marketplace Marketplace asociado.
 * @param {string|number} orderId Identificador del pedido.
 * @param {string|number} shipmentId Identificador del envío.
 * @param {Buffer|Stream} fileBuffer Archivo binario de evidencia (imagen/PDF).
 * @param {string} filename Nombre del archivo final.
 * @param {string} mimetype Tipo MIME del archivo (e.g. 'image/jpeg').
 * @returns {Promise<Object>} Promesa con la respuesta de la API.
 */
function uploadEvidence(
  sellerId,
  marketplace,
  orderId,
  shipmentId,
  fileBuffer,
  filename,
  mimetype,
) {
  const form = new FormData();
  // INFO: Campo 'evidencia' según especificación del endpoint.
  form.append('evidencia', fileBuffer, { filename, contentType: mimetype });
  return httpClient.post(
    ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2(sellerId, marketplace, orderId, shipmentId),
    form,
    { headers: form.getHeaders() },
  );
}

// ANCHOR: cancel-order-part
/**
 * Cancela una partida de un pedido (antes de envío). El body debe incluir campos obligatorios
 * definidos por la API: pedido, relationId, idtienda, reasonId y marketplace.
 * @param {Object} body Cuerpo de la solicitud conforme al contrato backend.
 * @returns {Promise<Object>} Promesa con la respuesta del backend.
 * @warn Asegurarse de que la partida no haya sido despachada para evitar errores 409.
 */
function cancelOrderPart(body) {
  return httpClient.post(ORDER_PART_CANCEL_ENDPOINT, body);
}

// ANCHOR: exports
/**
 * Exporta las funciones públicas del servicio de órdenes.
 * @module orderService
 */
module.exports = {
  listOrders,
  downloadPurchaseOrder,
  downloadShippingLabel,
  uploadOrderGuide,
  uploadEvidence,
  cancelOrderPart,
};

// NOTE: Mantener agrupadas descargas, cargas y actualizaciones para facilitar lectura.
// TODO: Agregar función de actualización de estado masivo si la API lo expone en el futuro.
// OPTIMIZE: Se podría agregar capa de retry con backoff para descargas si son críticas.
