# Changelog

Todas las modificaciones relevantes de este proyecto se documentan aquí.

## [1.0.0] - 2025-09-09

### Added
- Cliente modular para la API T1Comercios con servicios:
  - auth (login/refresh)
  - products (CRUD, estado, SKUs)
  - files (upload multipart)
  - catalogs (marcas, árbol/detalle de categorías, matches)
  - orders (listado, descargas PDF, guías, evidencias, cancelación parcial)
- httpClient (Axios) con interceptores:
  - Inyección automática de Authorization Bearer
  - Normalización de `response.data`
  - Reintento único en 401 tras renovar token
- tokenManager con patrón single-flight para `refresh/login`
- Endpoints centralizados en `src/constants/const.ts`
- Pruebas unitarias con Jest + Nock para servicios y utilidades
- Tooling de calidad: ESLint + Prettier + EditorConfig + ajustes de VS Code
- Documentación: README, CONTRIBUTING y LICENSE (MIT)

### Changed
- Centralización del endpoint de autenticación OIDC en `src/constants/const.ts`

### Notes
- Configuración en `src/config/index.js` (precedencia env > json > defaults)
- Tokens se almacenan en memoria; considerar store compartido si hay múltiples procesos