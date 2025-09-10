<!-- t1-api-client/README.md -->

# t1-api-client

Cliente Node.js para la API de T1Comercios. Provee servicios listos para usar (autenticación, productos, archivos, catálogos y pedidos), un cliente HTTP central con inyección automática de token y pruebas unitarias.

- Minimalista y modular (SRP: responsabilidad única por servicio)
- Token JWT inyectado vía interceptores de Axios y renovación controlada
- Endpoints centralizados en `src/constants/const.ts`
- Suite de tests con Jest + Nock
- Lint/format con ESLint + Prettier

## Tabla de contenidos
- Requisitos
- Instalación
- Configuración
- Uso rápido
- Referencia de APIs (servicios)
- Arquitectura y decisiones
- Pruebas
- Lint y formato
- Estructura del proyecto
- Contribución
- Licencia

## Requisitos
- Node.js 18+ recomendado (soporte de ESM modernos y fetch/URLSearchParams nativos)

## Instalación
Instalación directa (cuando esté publicado):

```bash
npm install t1-api-client
```

Instalación local (si trabajas con el repo):

```bash
# desde la carpeta superior al repo
npm install ../t1-api-client
```

## Configuración
El cliente toma su configuración desde variables de entorno (precedencia: `process.env` > `config.json` > valores por defecto).

Variables principales:
- `T1_BASE_URL` (default: https://api.t1comercios.com)
- `T1_CLIENT_ID` (default: integradores)
- `T1_USERNAME` (requerida para login ROPC)
- `T1_PASSWORD` (requerida para login ROPC)
- `T1_EXPIRY_SKEW_SECONDS` (default: 60) margen para renovar el token antes de expirar
- `T1_HTTP_TIMEOUT_MS` (default: 10000) timeout por petición

Ejemplo `.env`:

```ini
T1_BASE_URL=https://api.t1comercios.com
T1_CLIENT_ID=integradores
T1_USERNAME=tu_usuario
T1_PASSWORD=tu_contraseña
```

Opcional: `config.json` en la raíz del repo con las mismas claves.

Seguridad: no subas credenciales a git. Usa variables de entorno o un gestor de secretos.

## Uso rápido
```js
// CommonJS
const t1 = require('t1-api-client');

async function run() {
  // 1) Autenticación (obtiene y persiste accessToken/refreshToken en memoria)
  await t1.auth.login();

  // 2) Consumir servicios (el token se inyecta automáticamente)
  const marcas = await t1.catalogs.listBrands();
  console.log('Marcas:', marcas.length);

  const productos = await t1.products.listProducts(123, { page: 1, size: 20 });
  console.log('Productos:', productos);
}

run().catch(console.error);
```

## Referencia de APIs (servicios)
Retornan `response.data` directamente (normalizado por el interceptor). Todos usan el cliente HTTP central `src/utils/httpClient.js`.

### authService
- `login(): Promise<string>` Autentica con ROPC y guarda tokens.
- `refresh(): Promise<string>` Renueva usando `refresh_token`.

Notas:
- Tokens y expiración se almacenan en `src/config/index.js` (in-memory).
- `tokenManager.ensureValidAccessToken()` asegura token válido y aplica single-flight para evitar múltiples refresh simultáneos.

### productService
- `createProduct(commerceId, productData)`
- `listProducts(commerceId, query)`
- `updateProduct(commerceId, productId, patch)` (merge-patch: `application/merge-patch+json`)
- `getProduct(commerceId, productId)`
- `deleteProduct(commerceId, productId)`
- `pauseProducts(commerceId, ids, salesChannels)`
- `activateProducts(commerceId, ids, salesChannels)`
- `listSkus(commerceId, productId)`

### fileService
- `uploadFile(bucketName, fileBuffer, filename, mimetype)` Subida multipart/form-data.

### catalogService
- `listBrands()`
- `getCategoryTree(channelId)`
- `getCategoryDetail(channelId, categoryId)`
- `getCategoryMatches(categoryId)`

### orderService
- `listOrders(sellerId, query)`
- `downloadPurchaseOrder(sellerId, marketplace, orderId, paymentOrder)` (PDF)
- `downloadShippingLabel(sellerId, marketplace, orderId, paymentOrder)` (PDF)
- `uploadOrderGuide(sellerId, marketplace, orderId, details)`
- `uploadEvidence(sellerId, marketplace, orderId, shipmentId, fileBuffer, filename, mimetype)` (multipart)
- `cancelOrderPart(body)`

## Arquitectura y decisiones
- Cliente HTTP único (Axios) con interceptores:
  - Request: inyecta `Authorization: Bearer <token>`.
  - Response: devuelve `response.data` y reintenta una única vez ante `401` tras renovar token.
- Gestión de tokens (`src/utils/tokenManager.js`):
  - `ensureValidAccessToken()` valida expiración, intenta `refresh()` y cae a `login()` si es necesario.
  - Single-flight: múltiples peticiones concurrentes comparten la misma promesa de renovación.
- Constantes centralizadas (`src/constants/const.ts`): todos los endpoints están definidos en un solo lugar.
- Configuración (`src/config/index.js`): precedencia env > json > defaults, almacenamiento in-memory de tokens.

## Pruebas
Framework: Jest. Mock HTTP: Nock.

Ejecutar la suite:

```bash
npm test
```

Cobertura (opcional):

```bash
npm run test -- --coverage
```

Notas de pruebas:
- Los tests mockean `src/constants/const.ts` para evitar compilar TS.
- Los servicios se prueban validando rutas, métodos y headers esperados.

## Lint y formato
Scripts disponibles:

```bash
npm run lint        # analiza el código
npm run lint:fix    # corrige problemas autofixables
npm run format      # aplica Prettier a todo el repo
npm run format:check
```

Configuración:
- ESLint: `.eslintrc.cjs` (base `eslint:recommended` + Prettier)
- Prettier: `.prettierrc`
- EditorConfig: `.editorconfig`
- VS Code: `.vscode/settings.json` (formatOnSave y fixAll.eslint)

## Estructura del proyecto

```
src/
  config/            # Carga de variables y estado de tokens
  constants/         # Endpoints y URLs (TypeScript)
  services/          # Servicios: auth, products, files, catalogs, orders
  utils/             # httpClient (Axios), tokenManager
tests/               # Jest + Nock
openapi/             # Especificación OpenAPI (referencia)
```

## Contribución
- Ejecuta `npm test` antes de abrir PR.
- Aplica `npm run lint:fix && npm run format`.
- No incluyas credenciales reales en commits.
- Para endpoints nuevos, declara primero las constantes en `src/constants/const.ts`.

## Licencia
MIT
