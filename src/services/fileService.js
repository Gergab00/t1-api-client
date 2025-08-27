/**
 * @file src/services/fileService.js
 * @description Servicio de archivos: expone función para subir archivos binarios (imágenes u otros)
 * a la API de T1Comercios usando multipart/form-data. Actualmente implementa únicamente
 * la carga simple a un bucket específico.
 */

// ANCHOR: dependencias
const httpClient = require('../utils/httpClient'); // Cliente HTTP centralizado
const FormData = require('form-data'); // Construcción de multipart/form-data
const { FILE_UPLOAD_ENDPOINT } = require('../constants/const'); // Endpoint dinámico de subida

// ANCHOR: upload-file
/**
 * Sube un archivo a un bucket de T1Comercios.
 * @param {string} bucketName Nombre del bucket destino.
 * @param {Buffer|Stream} fileBuffer Contenido binario del archivo.
 * @param {string} filename Nombre original del archivo.
 * @param {string} mimetype Tipo MIME (p.ej. 'image/jpeg').
 * @returns {Promise<Object>} Promesa que resuelve con la respuesta de la API (incluye URL de descarga / metadatos).
 * @example
 * const res = await uploadFile('imagenes', buffer, 'foto.jpg', 'image/jpeg');
 */
function uploadFile(bucketName, fileBuffer, filename, mimetype) {
  const form = new FormData(); // INFO: FormData permite construir multipart para transmisión binaria.
  form.append('file', fileBuffer, { filename, contentType: mimetype }); // INFO: Campo principal del archivo.
  form.append('filename', filename); // INFO: Nombre explícito redundante según contrato API.
  form.append('mimetype', mimetype); // INFO: Facilita validaciones de tipo en backend.
  form.append('private', 'false'); // NOTE: 'false' => archivo público según convención del backend.

  return httpClient.post(FILE_UPLOAD_ENDPOINT(bucketName), form, { headers: form.getHeaders() }); // Retorna promesa HTTP.
}

// ANCHOR: exports
/**
 * Exporta las operaciones del servicio de archivos.
 * @module fileService
 */
module.exports = { uploadFile };

// TODO: Implementar soporte para cambio de visibilidad (privado/true) si se requiere.
// OPTIMIZE: Agregar validación previa de tamaño/mimetype antes de enviar para evitar roundtrip.