# Contribución a t1-api-client

¡Gracias por tu interés en contribuir! Este documento explica el flujo básico para proponer cambios.

## Requisitos previos
- Node.js 18+ y npm
- Cuenta de GitHub

## Flujo de trabajo
1. Haz un fork del repositorio y crea una rama descriptiva:
   - `feat/nueva-funcion` o `fix/caso-borde`
2. Instala dependencias y verifica la suite:
   - `npm install`
   - `npm test`
3. Aplica el formato y corrige lint:
   - `npm run lint:fix && npm run format`
4. Añade/actualiza pruebas unitarias.
5. Abre un Pull Request describiendo:
   - Qué cambia, por qué y cómo se probó.

## Estilo de código
- Usa Prettier y ESLint (scripts disponibles).
- Mantén comentarios JSDoc y anclas (Comment Anchors) en nuevas funciones.

## Endpoints nuevos
- Declara primero las constantes en `src/constants/const.ts`.
- Implementa el servicio en `src/services/` y añade tests en `tests/`.

## Lanzamientos (mantainers)
- Actualiza `CHANGELOG.md` y `package.json` (versión semántica).
- `npm publish` (asegúrate de haber hecho `npm login`).

Gracias por contribuir 🙌
