/**
 * @file src/constants/const.ts
 * @description Archivo central de constantes de endpoints y URLs base.
 * Centraliza todas las cadenas utilizadas para construir rutas del API con el fin de:
 *  - Evitar "magic strings" dispersas.
 *  - Facilitar refactors de versión / path / dominio.
 *  - Homogeneizar la forma de declarar endpoints parametrizados.
 *
 * Convenciones:
 *  - Constantes simples: MAYUSCULAS_SEPARADAS_POR_GUION_BAJO.
 *  - Endpoints parametrizados: funciones flecha con tipos explícitos (string | number).
 *  - No incluir barra final redundante salvo que el contrato la exija.
 *  - Mantener agrupación temática con anclas para navegación.
 */

// ANCHOR: url-base
/** URL base por defecto del API T1Comercios (fallback en config). */
export const T1_DEFAULT_BASE_URL = 'https://api.t1comercios.com';

// ANCHOR: auth-endpoint
/** Endpoint absoluto de autenticación OpenID Connect (grant password) para obtener token JWT. */
export const AUTH_TOKEN_ENDPOINT = 'https://loginclaro.com/auth/realms/plataforma-claro/protocol/openid-connect/token';

// Nota: Si aparecen nuevas URLs absolutas (http/https) en el código, agrégalas aquí.
// Luego reemplazaremos sus usos en los servicios / config para evitar duplicación.

/**
 * Endpoints (paths relativos) utilizados en los servicios.
 * Se definen como constantes para facilitar refactors y evitar strings mágicas.
 */

// ANCHOR: catalogo
// SECTION: catalogo-marcas-categorias
// INFO: Endpoints relacionados con catálogos maestros (marcas / categorías).
export const BRANDS_LIST_ENDPOINT = '/api-resource/api/v1/brands';
export const CATEGORY_TREE_ENDPOINT = (channelId: string | number) => `/cm/v2/sales_channel/${channelId}/category/`;
export const CATEGORY_DETAIL_ENDPOINT = (channelId: string | number, categoryId: string | number) => `/cm/v2/sales_channel/${channelId}/category/${categoryId}`;

// ANCHOR: archivos
// INFO: Endpoints para operaciones de subida de archivos.
export const FILE_UPLOAD_ENDPOINT = (bucketName: string) => `/file/v1.1/${bucketName}`;

// ANCHOR: pedidos
// SECTION: pedidos-principales
// INFO: Endpoints relacionados con órdenes (pedidos) y sus documentos asociados.
export const ORDERS_LIST_ENDPOINT = (sellerId: string | number) => `/kidal/v1/Ordersfull/seller/${sellerId}`;
export const PURCHASE_ORDER_DOWNLOAD_ENDPOINT = (sellerId: string | number, marketplace: string, orderId: string | number, paymentOrder: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/payment_order/${paymentOrder}`;
export const SHIPPING_LABEL_DOWNLOAD_ENDPOINT = (sellerId: string | number, marketplace: string, orderId: string | number, paymentOrder: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipping_label/${paymentOrder}`;
export const ORDER_GUIDE_UPLOAD_ENDPOINT = (sellerId: string | number, marketplace: string, orderId: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment`;
export const ORDER_EVIDENCE_UPLOAD_ENDPOINT = (sellerId: string | number, marketplace: string, orderId: string | number, shipmentId: string | number) => `/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/evidence/`;
export const ORDER_PART_CANCEL_ENDPOINT = '/kidal/v1/order/pedido/cancel';

// NOTE: El endpoint de evidencia correcto incluye prefijo /kidal/v1/ (verificado en colección Postman)
export const ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2 = (sellerId: string | number, marketplace: string, orderId: string | number, shipmentId: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/evidence/`;

// ANCHOR: pedidos-adicionales
// INFO: Endpoints aún no integrados en los servicios, reservados para futuras implementaciones.
export const ORDERS_STATISTICS_ENDPOINT = (sellerId: string | number) => `/kidal/v1/Ordersfull/statistics/seller/${sellerId}`;
export const ORDER_COLOCATION_ENDPOINT = (sellerId: string | number, marketplace: string, colocationId: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/colocation/${colocationId}`;
export const ORDER_SHIPMENT_STATUS_ENDPOINT = (sellerId: string | number, marketplace: string, orderId: string | number, shipmentId: string | number) => `/kidal/v1/order/seller/${sellerId}/marketplace/${marketplace}/order/${orderId}/shipment/${shipmentId}/status`;

// ANCHOR: productos
// SECTION: productos-basico
// INFO: Endpoints CRUD y operaciones de estado sobre productos y SKUs.
export const PRODUCT_COLLECTION_ENDPOINT = (commerceId: string | number) => `/cm/v2/product/commerce/${commerceId}/product`;
export const PRODUCT_ITEM_ENDPOINT = (commerceId: string | number, productId: string | number) => `/cm/v2/product/commerce/${commerceId}/product/${productId}`;
export const PRODUCT_PAUSE_ENDPOINT = (commerceId: string | number) => `/cm/v2/product/commerce/${commerceId}/pause/`;
export const PRODUCT_ACTIVATE_ENDPOINT = (commerceId: string | number) => `/cm/v2/product/commerce/${commerceId}/active/`;
export const PRODUCT_SKUS_ENDPOINT = (commerceId: string | number, productId: string | number) => `/cm/v2/product/commerce/${commerceId}/product/${productId}/sku`;
export const PRODUCT_WEBHOOK_EDIT_ENDPOINT = (commerceId: string | number) => `/cm/v2/product/webhook/commerce/${commerceId}/product/edit`;

// ANCHOR: catalogos-adicionales
// INFO: Endpoints complementarios de catálogo.
export const CATEGORY_MATCHES_ENDPOINT = (categoryId: string | number) => `/cm/v2/sales_channel/category/${categoryId}/matches`;

// ANCHOR: sales-channel
// INFO: Endpoints para información de canales de venta asociados a un comercio.
export const SALES_CHANNEL_COMMERCE_ENDPOINT = (commerceId: string | number) => `/identity/v1/sales_channel/commerce/${commerceId}`;

// ANCHOR: export-default
/**
 * Exportación por defecto agrupando todas las constantes. Facilita importación centralizada:
 * import consts from '../constants/const';
 */
export default {
	T1_DEFAULT_BASE_URL,
	AUTH_TOKEN_ENDPOINT,
	BRANDS_LIST_ENDPOINT,
	CATEGORY_TREE_ENDPOINT,
	CATEGORY_DETAIL_ENDPOINT,
	FILE_UPLOAD_ENDPOINT,
	ORDERS_LIST_ENDPOINT,
	PURCHASE_ORDER_DOWNLOAD_ENDPOINT,
	SHIPPING_LABEL_DOWNLOAD_ENDPOINT,
	ORDER_GUIDE_UPLOAD_ENDPOINT,
	ORDER_EVIDENCE_UPLOAD_ENDPOINT,
	ORDER_EVIDENCE_UPLOAD_ENDPOINT_V2,
	ORDER_PART_CANCEL_ENDPOINT,
	ORDERS_STATISTICS_ENDPOINT,
	ORDER_COLOCATION_ENDPOINT,
	ORDER_SHIPMENT_STATUS_ENDPOINT,
	PRODUCT_COLLECTION_ENDPOINT,
	PRODUCT_ITEM_ENDPOINT,
	PRODUCT_PAUSE_ENDPOINT,
	PRODUCT_ACTIVATE_ENDPOINT,
	PRODUCT_SKUS_ENDPOINT,
	PRODUCT_WEBHOOK_EDIT_ENDPOINT,
	CATEGORY_MATCHES_ENDPOINT,
	SALES_CHANNEL_COMMERCE_ENDPOINT,
};

// TODO: Evaluar parametrización de versión (v1, v2, v1.1) para reducir duplicación.
// OPTIMIZE: Implementar fábrica de endpoints con prefijos para ambientes (staging / prod).
// NOTE: Mantener orden de grupos para lectura rápida.
