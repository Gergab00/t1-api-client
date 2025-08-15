/**
 * @file src/index.js
 * @description Punto de entrada principal del paquete. Importa los servicios
 * individuales y los expone como propiedades de un único objeto para
 * facilitar su consumo en otras aplicaciones. Antes de usar cualquier
 * servicio, es necesario invocar `auth.login()` para obtener el token.
 */

const auth = require('./services/authService');
const products = require('./services/productService');
const files = require('./services/fileService');
const catalogs = require('./services/catalogService');
const orders = require('./services/orderService');

module.exports = {
  auth,
  products,
  files,
  catalogs,
  orders,
};