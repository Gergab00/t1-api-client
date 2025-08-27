/**
 * @file src/services/catalogService.js
 * @description Servicio de catálogos oficiales (marcas y categorías). Proporciona funciones
 * simples (wrappers GET) que delegan toda la lógica de filtrado y estructura en el backend.
 * Mantiene responsabilidad única: construir endpoint y ejecutar petición.
 */

// ANCHOR: dependencias
const httpClient = require('../utils/httpClient'); // Cliente HTTP centralizado
const { BRANDS_LIST_ENDPOINT, CATEGORY_TREE_ENDPOINT, CATEGORY_DETAIL_ENDPOINT } = require('../constants/const'); // Endpoints catalogación

// ANCHOR: list-brands
/**
 * Obtiene la lista de marcas oficiales.
 * @returns {Promise<Object[]>} Promesa que resuelve con un arreglo de marcas (estructura según API).
 * @example
 * const marcas = await listBrands();
 */
function listBrands() {
  return httpClient.get(BRANDS_LIST_ENDPOINT);
}

// ANCHOR: get-category-tree
/**
 * Obtiene el árbol jerárquico completo de categorías para un canal de ventas.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @returns {Promise<Object>} Promesa con la estructura (nodos con hijos) de categorías.
 * @example
 * const tree = await getCategoryTree(7);
 */
function getCategoryTree(channelId) {
  return httpClient.get(CATEGORY_TREE_ENDPOINT(channelId));
}

// ANCHOR: get-category-detail
/**
 * Obtiene el detalle (incluyendo atributos) de una categoría específica.
 * @param {string|number} channelId Identificador del canal de ventas.
 * @param {string|number} categoryId Identificador único de la categoría.
 * @returns {Promise<Object>} Promesa con detalle y metadatos de la categoría.
 * @example
 * const detail = await getCategoryDetail(7, 1234);
 */
function getCategoryDetail(channelId, categoryId) {
  return httpClient.get(CATEGORY_DETAIL_ENDPOINT(channelId, categoryId));
}

// ANCHOR: exports
/**
 * Exporta las funciones públicas del servicio de catálogos.
 * @module catalogService
 */
module.exports = { listBrands, getCategoryTree, getCategoryDetail };

// NOTE: Si en el futuro se añaden filtros de profundidad o paginación, crear funciones separadas para mantener SRP.