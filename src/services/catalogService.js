/**
 * @file src/services/catalogService.js
 * @description Servicio para acceder a los catálogos oficiales de T1,
 * incluyendo marcas y categorías. Los métodos de este módulo son
 * simples envoltorios de llamadas GET a los endpoints del API.
 */

const httpClient = require('../utils/httpClient');

/**
 * Obtiene la lista de marcas oficiales.
 * @returns {Promise<Object[]>} Array de marcas.
 */
function listBrands() {
  return httpClient.get('/api-resource/api/v1/brands');
}

/**
 * Obtiene el árbol de categorías de un canal de ventas específico.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @returns {Promise<Object>} Estructura jerárquica de categorías.
 */
function getCategoryTree(channelId) {
  return httpClient.get(`/cm/v2/sales_channel/${channelId}/category/`);
}

/**
 * Obtiene el detalle de una categoría específica de un canal de ventas.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @param {string|number} categoryId Identificador de la categoría.
 * @returns {Promise<Object>} Detalle de la categoría y atributos.
 */
function getCategoryDetail(channelId, categoryId) {
  return httpClient.get(`/cm/v2/sales_channel/${channelId}/category/${categoryId}`);
}

module.exports = {
  listBrands,
  getCategoryTree,
  getCategoryDetail,
};