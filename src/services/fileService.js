/**
 * @file src/services/fileService.js
 * @description Contiene funciones para subir archivos (imágenes u otros)
 * a la API de T1Comercios. Usa multipart/form-data para transmitir
 * archivos binarios. Actualmente solo implementa la carga de un archivo
 * en un bucket específico.
 */

const httpClient = require('../utils/httpClient');
const FormData = require('form-data');

/**
 * Sube un archivo a un bucket de T1Comercios. La API requiere
 * parámetros de multipart/form-data como `file`, `filename`, `mimetype`
 * y un indicador `private` para marcar el objeto como privado o público.
 *
 * @param {string} bucketName Nombre del bucket destino.
 * @param {Buffer|Stream} fileBuffer Contenido del archivo.
 * @param {string} filename Nombre original del archivo.
 * @param {string} mimetype Tipo MIME del archivo (p. ej. image/jpeg).
 * @returns {Promise<Object>} Respuesta de la API con la URL de descarga.
 */
function uploadFile(bucketName, fileBuffer, filename, mimetype) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename, contentType: mimetype });
  form.append('filename', filename);
  form.append('mimetype', mimetype);
  // Por defecto el archivo es público; el valor 'false' lo hace público en T1
  form.append('private', 'false');

  return httpClient.post(`/file/v1.1/${bucketName}`, form, { headers: form.getHeaders() });
}

module.exports = { uploadFile };