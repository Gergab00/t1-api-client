/**
 * @file src/utils/httpClient.js
 * @description Define una instancia reutilizable de Axios para invocar
 * la API de T1Comercios. El cliente se configura con la URL base
 * proveniente de la configuración global y añade interceptores para:
 *   1. Adjuntar el token JWT en el encabezado Authorization de cada
 *      solicitud cuando está disponible.
 *   2. Centralizar el manejo de respuestas y errores, de modo que los
 *      servicios consuman una interfaz homogénea.
 */

const axios = require('axios');
const config = require('../config');

// Crear la instancia base de Axios
const httpClient = axios.create({
  baseURL: config.baseURL,
  timeout: 10000,
});

// Interceptor de solicitud: agrega el token al header si existe.
httpClient.interceptors.request.use((request) => {
  if (config.accessToken) {
    request.headers.Authorization = `Bearer ${config.accessToken}`;
  }
  return request;
});

// Interceptor de respuesta: devuelve directamente la data o mapea errores.
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errResp = error.response || {};
    return Promise.reject({
      status: errResp.status,
      message:
        (errResp.data && errResp.data.message) || error.message || 'Error desconocido',
    });
  }
);

module.exports = httpClient;