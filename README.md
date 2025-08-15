<!-- t1-api-client/README.md -->

# t1-api-client

Un cliente modular para consumir la **API T1Comercios** desde aplicaciones Node.js. El objetivo es simplificar la autenticación y las operaciones comunes como la gestión de productos, subida de archivos, consulta de catálogos y pedidos. Este paquete sigue el principio de **responsabilidad única**, documenta sus módulos y se publica a través de NPM.

## Instalación

Instala la dependencia mediante NPM:

```bash
npm install t1-api-client
```

O bien, instala desde un repositorio local tras ejecutar `npm pack`:

```bash
npm install ../t1-api-client-1.0.0.tgz
```

## Configuración

El paquete utiliza variables de entorno para configurar la URL base del API y las credenciales de autenticación. Crea un archivo `.env` en la raíz de tu proyecto y define:

```ini
T1_BASE_URL=https://api.t1comercios.com
T1_CLIENT_ID=integradores
T1_USERNAME=tu_usuario
T1_PASSWORD=tu_contraseña
```

Si prefieres un archivo JSON, puedes crear `config.json` con los mismos campos y editar `src/config/index.js` para leerlo.

## Uso básico

El cliente exporta varios servicios agrupados según su responsabilidad. Asegúrate de llamar a `auth.login()` antes de realizar otras operaciones para obtener y guardar el token de acceso. Por ejemplo:

```js
const { auth, products } = require('t1-api-client');

async function main() {
  // Autenticarse y obtener token
  await auth.login();

  // Crear un nuevo producto
  const producto = await products.createProduct('COMMERCE_ID', {
    sku_padre: 'ABC123',
    name: 'Producto de ejemplo',
    // ...resto de datos
  });
  console.log('Producto creado', producto);
}

main().catch(console.error);
```

Consulta la documentación en `/src/services` para conocer todos los métodos disponibles.

## Pruebas

Las pruebas unitarias utilizan [Jest](https://jestjs.io/) y [Nock](https://github.com/nock/nock) para simular los endpoints del API. Ejecuta las pruebas con:

```bash
npm test
```

## Publicación

Para publicar el paquete en NPM:

1. Verifica que `package.json` contiene los campos `name`, `version`, `description` y `main`.
2. Ejecuta `npm login` con una cuenta de NPM válida.
3. Ejecuta `npm publish`. Asegúrate de que el nombre de paquete sea único.

## Licencia

MIT