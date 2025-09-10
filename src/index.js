/**
 * @file src/index.js
 * @description Punto de entrada principal del paquete (módulo público).
 * Centraliza y re-exporta los servicios disponibles (autenticación, productos,
 * archivos, catálogos y órdenes) para facilitar su importación desde
 * aplicaciones cliente. Antes de consumir cualquier servicio que requiera
 * autorización, es indispensable establecer sesión mediante `auth.login()` y
 * conservar/propagar el token gestionado internamente por el cliente HTTP.
 *
 * Uso típico:
 * const t1 = require('t1-api-client');
 * await t1.auth.login({ username, password });
 * const lista = await t1.products.list();
 *
 * Este módulo no ejecuta lógica adicional (no side-effects) al ser cargado.
 */

// ANCHOR: imports-servicios
// SECTION: importacion-servicios
// INFO: Se importan los módulos de servicios especializados. Cada servicio encapsula
// INFO: operaciones específicas contra el API remoto (principio de responsabilidad única).
// NOTE: Mantener rutas relativas sincronizadas si se reestructura la carpeta `services`.

const auth = require('./services/authService'); // Servicio de autenticación
const products = require('./services/productService'); // Servicio de productos
const files = require('./services/fileService'); // Servicio de archivos
const catalogs = require('./services/catalogService'); // Servicio de catálogos
const orders = require('./services/orderService'); // Servicio de órdenes

// ANCHOR: export-agrupado-servicios
/**
 * Objeto agregador de servicios T1.
 * @type {{
 *  auth: import('./services/authService'),
 *  products: import('./services/productService'),
 *  files: import('./services/fileService'),
 *  catalogs: import('./services/catalogService'),
 *  orders: import('./services/orderService')
 * }}
 * @property {import('./services/authService')} auth Servicio de autenticación y gestión de token. Debe invocarse primero (login / refresh) antes de usar otros servicios que requieran autorización.
 * @property {import('./services/productService')} products Servicio para operaciones sobre productos.
 * @property {import('./services/fileService')} files Servicio para manejo de archivos.
 * @property {import('./services/catalogService')} catalogs Servicio para interacción con catálogos.
 * @property {import('./services/orderService')} orders Servicio para operaciones sobre órdenes/pedidos.
 * @exports auth
 * @exports products
 * @exports files
 * @exports catalogs
 * @exports orders
 * @see ./services/authService
 * @see ./services/productService
 * @see ./services/fileService
 * @see ./services/catalogService
 * @see ./services/orderService
 * @example
 * const { auth, products } = require('t1-api-client');
 * await auth.login({ user: 'demo', password: 'secret' });
 * const listado = await products.list();
 */
module.exports = { auth, products, files, catalogs, orders };

// NOTE: Si se añaden nuevos servicios, importarlos arriba y agregarlos al objeto exportado.
// TODO: Considerar exponer tipos / interfaces (TypeScript) en una versión futura para mejorar autocompletado.
// OPTIMIZE: Podría evaluarse lazy-loading de servicios si su inicialización futura implica sobrecarga.
