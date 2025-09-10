/**
 * @file src/services/productService.js
 * @description Servicio de productos: expone funciones para interactuar con los
 * endpoints de productos de T1Comercios. Incluye operaciones de creación, listado,
 * actualización (merge patch), obtención, eliminación, activación/pausa de publicación
 * y recuperación de variaciones (SKUs) de un producto padre.
 *
 * Todas las funciones son wrappers finos sobre el `httpClient` para mantener
 * responsabilidad única (construcción de endpoint + payload + llamada HTTP).
 * No se realiza transformación de negocio avanzada (delega en la API).
 */

// ANCHOR: dependencias
const httpClient = require('../utils/httpClient'); // Cliente HTTP configurado (token, interceptores)
const {
  PRODUCT_COLLECTION_ENDPOINT,
  PRODUCT_ITEM_ENDPOINT,
  PRODUCT_PAUSE_ENDPOINT,
  PRODUCT_ACTIVATE_ENDPOINT,
  PRODUCT_SKUS_ENDPOINT,
  PRODUCT_WEBHOOK_EDIT_ENDPOINT, // NOTE: Reservado para futuras operaciones de edición vía webhook.
} = require('../constants/const');

// ANCHOR: create-product
/**
 * Crea un nuevo producto en un comercio específico.
 * @param {string|number} commerceId Identificador del comercio (path param).
 * @param {Object} productData Objeto que describe el producto conforme al contrato de la API.
 * @returns {Promise<Object>} Promesa que resuelve con el recurso producto creado.
 * @throws {Promise<Error>} Rechaza con objeto de error normalizado (status, message) si falla.
 * @example
 * const nuevo = await createProduct(123, { name: 'Zapato', price: 19.9 });
 */
function createProduct(commerceId, productData) {
  // INFO: Se envía el body completo (creación); validaciones estructurales recaen en backend.
  return httpClient.post(PRODUCT_COLLECTION_ENDPOINT(commerceId), productData);
}

// ANCHOR: list-products
/**
 * Obtiene una lista de productos de un comercio, con filtros y paginación opcionales.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Object} [query={}] Parámetros de query (p.ej. page, size, status, search).
 * @returns {Promise<Object[]>} Promesa con arreglo de productos (o estructura paginada según API).
 * @example
 * const productos = await listProducts(123, { page: 1, size: 50 });
 */
function listProducts(commerceId, query = {}) {
  // INFO: Los params se pasan dentro de objeto { params } para Axios.
  return httpClient.get(PRODUCT_COLLECTION_ENDPOINT(commerceId), { params: query });
}

// ANCHOR: update-product
/**
 * Actualiza parcialmente un producto utilizando JSON Merge Patch.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto a modificar.
 * @param {Object} patch Objeto con los cambios siguiendo RFC 7386 (application/merge-patch+json).
 * @returns {Promise<Object>} Promesa con el producto actualizado.
 * @warn Asegurarse de enviar únicamente campos a modificar para evitar sobrescrituras no deseadas.
 * @example
 * await updateProduct(123, 999, { price: 25.5, active: true });
 */
function updateProduct(commerceId, productId, patch) {
  // INFO: Se define explícitamente el header de Content-Type para indicar formato merge-patch.
  return httpClient.patch(PRODUCT_ITEM_ENDPOINT(commerceId, productId), patch, {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
}

// ANCHOR: get-product
/**
 * Obtiene la información de un producto específico.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto.
 * @returns {Promise<Object>} Promesa con el detalle del producto.
 */
function getProduct(commerceId, productId) {
  return httpClient.get(PRODUCT_ITEM_ENDPOINT(commerceId, productId));
}

// ANCHOR: delete-product
/**
 * Elimina un producto del catálogo (operación destructiva).
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto.
 * @returns {Promise<Object>} Promesa con la respuesta de la API tras la eliminación.
 * @warn Verificar dependencias (SKUs, referencias) antes de eliminar para evitar inconsistencias.
 */
function deleteProduct(commerceId, productId) {
  return httpClient.delete(PRODUCT_ITEM_ENDPOINT(commerceId, productId));
}

// ANCHOR: pause-products
/**
 * Pausa la publicación de múltiples productos en uno o más canales de venta.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Array<string|number>} ids Identificadores de productos a pausar.
 * @param {Array<string|number>} salesChannels Canales de venta a pausar (códigos esperados por API).
 * @returns {Promise<Object>} Promesa con resultado de la operación (generalmente listado de estados).
 */
function pauseProducts(commerceId, ids, salesChannels) {
  // INFO: Se envía un payload masivo para operación en lote.
  return httpClient.post(PRODUCT_PAUSE_ENDPOINT(commerceId), { ids, salesChannels });
}

// ANCHOR: activate-products
/**
 * Activa (publica) múltiples productos en los canales de venta indicados.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Array<string|number>} ids Identificadores de productos a activar.
 * @param {Array<string|number>} salesChannels Canales de venta sobre los que se aplica la activación.
 * @returns {Promise<Object>} Promesa con el resultado devuelto por la API.
 */
function activateProducts(commerceId, ids, salesChannels) {
  return httpClient.post(PRODUCT_ACTIVATE_ENDPOINT(commerceId), { ids, salesChannels });
}

// ANCHOR: list-skus
/**
 * Obtiene las variaciones (SKUs) de un producto padre.
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto padre.
 * @returns {Promise<Object[]>} Promesa que resuelve con array de SKUs asociados.
 */
function listSkus(commerceId, productId) {
  return httpClient.get(PRODUCT_SKUS_ENDPOINT(commerceId, productId));
}

// ANCHOR: exports
/**
 * Exporta el conjunto de funciones del servicio de productos.
 * @module productService
 */
module.exports = {
  createProduct,
  listProducts,
  updateProduct,
  getProduct,
  deleteProduct,
  pauseProducts,
  activateProducts,
  listSkus,
};

// NOTE: Mantener orden lógico (CRUD, estado, relaciones) para facilitar lectura.
// TODO: Añadir función para edición de producto vía webhook cuando el endpoint esté definido en la API.
// OPTIMIZE: Posible cache local (TTL) para lecturas frecuentes (getProduct/listProducts) en futura iteración.
