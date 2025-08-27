/**
 * @file src/services/catalogService.js
 * @description Servicio para acceder a los catálogos oficiales de T1,
 * incluyendo marcas y categorías. Los métodos de este módulo son
 * simples envoltorios de llamadas GET a los endpoints del API.
 */

const httpClient = require('../utils/httpClient');
const {
  BRANDS_LIST_ENDPOINT,
  CATEGORY_TREE_ENDPOINT,
  CATEGORY_DETAIL_ENDPOINT,
} = require('../constants/const');

/**
 * Obtiene la lista de marcas oficiales.
 * @returns {Promise<Object[]>} Array de marcas.
 */
function listBrands() {
  return httpClient.get(BRANDS_LIST_ENDPOINT);
}

/**
 * Obtiene el árbol de categorías de un canal de ventas específico.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @returns {Promise<Object>} Estructura jerárquica de categorías.
 */
function getCategoryTree(channelId) {
  return httpClient.get(CATEGORY_TREE_ENDPOINT(channelId));
}

/**
 * Obtiene el detalle de una categoría específica de un canal de ventas.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @param {string|number} categoryId Identificador de la categoría.
 * @returns {Promise<Object>} Detalle de la categoría y atributos.
 */
function getCategoryDetail(channelId, categoryId) {
  return httpClient.get(CATEGORY_DETAIL_ENDPOINT(channelId, categoryId));
}

module.exports = {
  listBrands,
  getCategoryTree,
  getCategoryDetail,
};