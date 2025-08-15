/**
 * @file src/services/productService.js
 * @description Proporciona funciones para interactuar con los
 * endpoints de productos de T1Comercios. Incluye operaciones de
 * creación, listado, actualización, obtención, eliminación y control
 * de publicación de productos, así como la obtención de variaciones
 * (SKUs) de un producto padre.
 */

const httpClient = require('../utils/httpClient');

/**
 * Crea un nuevo producto en un comercio específico.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Object} productData Objeto que describe el producto conforme a la API.
 * @returns {Promise<Object>} Objeto con datos del producto creado.
 */
function createProduct(commerceId, productData) {
  return httpClient.post(`/cm/v2/product/commerce/${commerceId}/product`, productData);
}

/**
 * Obtiene una lista de productos de un comercio, con filtros opcionales.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Object} [query={}] Objeto con parámetros de búsqueda y paginación.
 * @returns {Promise<Object[]>} Lista de productos según la API.
 */
function listProducts(commerceId, query = {}) {
  return httpClient.get(`/cm/v2/product/commerce/${commerceId}/product`, { params: query });
}

/**
 * Actualiza parcialmente un producto utilizando JSON Merge Patch.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto.
 * @param {Object} patch Objeto con los cambios siguiendo merge-patch.
 * @returns {Promise<Object>} Producto actualizado.
 */
function updateProduct(commerceId, productId, patch) {
  return httpClient.patch(
    `/cm/v2/product/commerce/${commerceId}/product/${productId}`,
    patch,
    { headers: { 'Content-Type': 'application/merge-patch+json' } }
  );
}

/**
 * Obtiene la información de un producto específico.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto.
 * @returns {Promise<Object>} Detalle del producto.
 */
function getProduct(commerceId, productId) {
  return httpClient.get(`/cm/v2/product/commerce/${commerceId}/product/${productId}`);
}

/**
 * Elimina un producto del catálogo.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto.
 * @returns {Promise<Object>} Respuesta de la API tras la eliminación.
 */
function deleteProduct(commerceId, productId) {
  return httpClient.delete(`/cm/v2/product/commerce/${commerceId}/product/${productId}`);
}

/**
 * Pausa la publicación de varios productos en determinados canales.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Array<string|number>} ids Lista de IDs de productos a pausar.
 * @param {Array<string|number>} salesChannels Canales de venta a pausar.
 * @returns {Promise<Object>} Respuesta de la API.
 */
function pauseProducts(commerceId, ids, salesChannels) {
  return httpClient.post(`/cm/v2/product/commerce/${commerceId}/pause/`, { ids, salesChannels });
}

/**
 * Activa la publicación de varios productos en determinados canales.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {Array<string|number>} ids Lista de IDs de productos a activar.
 * @param {Array<string|number>} salesChannels Canales de venta para activar.
 * @returns {Promise<Object>} Respuesta de la API.
 */
function activateProducts(commerceId, ids, salesChannels) {
  return httpClient.post(`/cm/v2/product/commerce/${commerceId}/active/`, { ids, salesChannels });
}

/**
 * Obtiene las variaciones (SKUs) de un producto padre.
 *
 * @param {string|number} commerceId Identificador del comercio.
 * @param {string|number} productId Identificador del producto padre.
 * @returns {Promise<Object[]>} Lista de SKUs.
 */
function listSkus(commerceId, productId) {
  return httpClient.get(`/cm/v2/product/commerce/${commerceId}/product/${productId}/sku`);
}

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