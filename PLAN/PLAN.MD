# Plan: Scriptorium MCP Channels remoto con auth mínima

Fecha: 2026-05-02  
Estado: plan aprobado para documentación; implementación pendiente.  
Restricción nueva: no tocar código existente; extender o crear componentes aparte.

## Resumen ejecutivo

El objetivo es desplegar `mcp-channels-sdk` en el VPS-GANDI usando el mismo servidor operativo del PUB OASIS, pero aislando el nuevo servicio bajo un nuevo host, por ejemplo `scriptorium.escrivivir.co`, detrás de Caddy/HTTPS.

La recomendación mínima es:

- Usar el mismo VPS y la misma clave SSH operativa de GANDI para despliegue.
- Crear un nuevo registro DNS `A` para `scriptorium.escrivivir.co` apuntando a la misma IP pública del VPS.
- Mantener `pub.escrivivir.co` intacto, con su site block/ruta Caddy actual.
- Añadir un site block Caddy separado para `scriptorium.escrivivir.co`.
- No exponer el puerto Node `3010` directamente a Internet.
- Usar token Bearer compartido para runtime/API mesh.
- Usar auth básica bcrypt de Socket.IO Admin UI para la consola admin.
- No introducir OAuth/JWT/DB de usuarios en el MVP.
- No modificar `SocketClient.ts`, `AlephScriptClient.ts`, `SocketServer.ts` ni el demo server existente; crear wrappers, variantes seguras o paquetes aparte.

## Respuesta al punto DNS/auth

Sí, puedes crear ahora `scriptorium.escrivivir.co` apuntando al mismo servidor donde ya apunta `pub.escrivivir.co`.

Esto no tiene por qué afectar a la web pública existente si se cumplen estas condiciones:

1. El DNS de ambos nombres apunta a la misma IP, pero Caddy decide qué servir por el header `Host`.
2. `pub.escrivivir.co` conserva su bloque Caddy propio y no se le añade auth global.
3. `scriptorium.escrivivir.co` tiene su bloque Caddy propio, con reverse proxy al nuevo servicio channels.
4. La auth se aplica solo dentro del bloque de `scriptorium.escrivivir.co`, o solo a rutas concretas como `/ui*`.
5. No se define `basic_auth` ni middlewares de auth en un bloque global que cubra todos los hosts.
6. No se levanta un segundo Caddy intentando ocupar también `80` y `443`; debe haber un único frontal Caddy o una coordinación explícita.

Conclusión: `pub.escrivivir.co` y `scriptorium.escrivivir.co` pueden convivir en el mismo VPS sin que la auth del nuevo servicio afecte al sitio público existente. La separación correcta debe hacerse por host virtual en Caddy.

Sobre “misma key”: para operar el VPS sí puedes reutilizar la misma clave SSH de `PATTERN/GANDI_DEVOPS_FOLDER/.ssh/gandi_pub_ed25519`. No conviene reutilizar esa clave como secreto de aplicación. Los tokens de MCP Channels deben ser secretos nuevos en `.env` del VPS.

## Alcance actualizado

### Incluido

1. Diseño de auth mínima para `mcp-channels-sdk` remoto.
2. Diseño Docker/Caddy para `scriptorium.escrivivir.co` en el mismo VPS-GANDI.
3. Separación segura respecto a `pub.escrivivir.co`.
4. Estrategia para clientes locales que conectan al VPS.
5. Estrategia de Socket.IO Admin UI con auth.
6. Enfoque no invasivo: crear nuevos wrappers/paquetes/configuración sin editar código existente.

### Excluido del MVP

1. OAuth/OIDC multiusuario.
2. Redis para cluster Socket.IO, salvo que luego haya varias instancias.
3. Exposición pública directa del puerto `3010`.
4. Tokens permanentes embebidos en bundles browser.
5. Modificaciones directas a clases existentes de `mcp-core-sdk` o demos actuales.

## Arquitectura recomendada

### DNS

- `pub.escrivivir.co` sigue apuntando a la IP actual del VPS.
- `scriptorium.escrivivir.co` se añade como nuevo registro `A` apuntando a la misma IP.
- Opcional: `channels.escrivivir.co` podría ser alias/CNAME futuro, pero para este plan se usará `scriptorium.escrivivir.co`.

### Frontal HTTPS

Usar Caddy como único punto de entrada público:

- Host `pub.escrivivir.co`: conserva rutas actuales del PUB OASIS.
- Host `scriptorium.escrivivir.co`: reverse proxy al servicio MCP Channels.
- TLS automático por host.
- Auth aplicada solo en el host/rutas de Scriptorium.

### Servicios internos

1. `channels-server`
   - Servicio Node/Socket.IO.
   - Puerto interno: `3010`.
   - No publicado en Internet.
   - Expuesto solo a Caddy por red Docker.

2. `channels-web` o Caddy frontal compartido
   - Recomendado: reutilizar/unificar el Caddy frontal si ya existe uno para PUB.
   - Alternativa: nuevo Caddy solo si no compite por `80/443`.

3. Admin UI
   - MVP: usar la UI integrada de Socket.IO Admin UI servida por el server bajo `/ui`.
   - Ruta recomendada: `https://scriptorium.escrivivir.co/ui`.
   - Namespace admin protegido por auth bcrypt.

## Auth mínima recomendada

### Capa 1: TLS y host isolation

Caddy termina HTTPS para `scriptorium.escrivivir.co`. Esto protege transporte y separa el tráfico del PUB por host virtual.

### Capa 2: token runtime/API

Crear un secreto nuevo:

- `MCP_CHANNELS_TOKEN`

Uso:

- Clientes Socket.IO runtime envían token en `socket.handshake.auth.token`.
- Endpoints REST `/mesh/*` aceptan `Authorization: Bearer <token>` o `X-MCP-Proxy-Auth`.
- Comparación timing-safe inspirada en `mcp-inspector-sdk/server/src/index.ts`.

Rutas protegidas:

- `/mesh/rooms`
- `/mesh/capabilities`
- `/mesh/invoke/*`
- Socket.IO namespace `/runtime`
- Socket.IO namespace base si se usa para clientes reales

Ruta opcionalmente pública o interna:

- `/mesh/health`

Recomendación: dejar `/mesh/health` accesible solo desde red interna Docker o devolver un health mínimo sin datos sensibles.

### Capa 3: Admin UI auth

Crear secretos nuevos:

- `MCP_CHANNELS_ADMIN_USERNAME`
- `MCP_CHANNELS_ADMIN_PASSWORD_BCRYPT`

Socket.IO Admin UI ya soporta:

- `auth.type = "basic"`
- username
- password bcrypt
- sesiones internas

No usar contraseña plana en `.env`. Guardar solo hash bcrypt.

### Capa 4 opcional: Caddy Basic Auth para `/ui*`

Se puede añadir una segunda barrera en Caddy solo para `/ui*` dentro de `scriptorium.escrivivir.co`.

No aplicar Basic Auth a `/socket.io*` globalmente porque podría romper clientes Socket.IO runtime, especialmente clientes browser.

## Enfoque no invasivo

El usuario indicó: “No tocamos el código existente, sino que extendemos o creamos uno aparte”.

Por tanto, la implementación futura debe evitar modificar estos archivos:

- `mcp-core-sdk/src/client/AlephScriptClient.ts`
- `mcp-core-sdk/src/client/SocketClient.ts`
- `mcp-core-sdk/src/server/SocketServer.ts`
- `mcp-core-sdk/src/server/SocketIoMesh.ts`
- `mcp-core-sdk/src/server/SocketIoMeshLogics.ts`
- `mcp-channels-sdk/ws-server/packages/socket-gym-demo/src/index.ts`
- `mcp-channels-sdk/ws-server/packages/socket-gym-demo/package.json`

En su lugar, crear componentes nuevos:

1. Nuevo paquete o carpeta de server seguro:
   - `mcp-channels-sdk/remote-server/`
   - o `mcp-channels-sdk/packages/socket-gym-vps-secure/`

2. Nuevo entrypoint seguro:
   - `SecureSocketIoMeshLogics`
   - `SecureSocketServer`
   - `secure-index.ts`

3. Nuevo cliente remoto:
   - `RemoteAlephScriptClient`
   - `RemoteSocketClient`
   - o una factory `createRemoteAlephScriptClient()`

4. Nuevo patrón de despliegue:
   - `PATTERN/SCRIPTORIUM_CHANNELS/`
   - o `mcp-channels-sdk/deploy/gandi/`

La opción más limpia es crear `PATTERN/SCRIPTORIUM_CHANNELS/` para docker/Caddy/env/scripts, y `mcp-channels-sdk/remote-server/` para el server seguro. Así no se altera el demo ni el SDK base.

## Plan de implementación no invasiva

### Fase 1 — Patrón de despliegue separado

Crear una carpeta nueva de patrón, sin tocar `PATTERN/OASIS_PUB`:

- `PATTERN/SCRIPTORIUM_CHANNELS/README.md`
- `PATTERN/SCRIPTORIUM_CHANNELS/docker-compose.scriptorium.yml`
- `PATTERN/SCRIPTORIUM_CHANNELS/Caddyfile.scriptorium`
- `PATTERN/SCRIPTORIUM_CHANNELS/.env.scriptorium.example`
- `PATTERN/SCRIPTORIUM_CHANNELS/scripts/deploy-scriptorium-channels.sh`
- `PATTERN/SCRIPTORIUM_CHANNELS/scripts/verify-scriptorium-channels.sh`

El compose seguirá el estilo de `PATTERN/OASIS_PUB/docker-compose.pub.yml`:

- `restart: unless-stopped`
- red bridge propia
- healthcheck
- variables obligatorias con placeholders seguros
- datos persistentes bajo `/srv/oasis/mcp-channels/`

### Fase 2 — Caddy host virtual sin afectar PUB

Preparar configuración Caddy separada para `scriptorium.escrivivir.co`.

Regla importante: si el PUB ya usa Caddy en `80/443`, no levantar otro Caddy que compita por esos puertos. Hay dos alternativas:

1. Integrar el bloque de `scriptorium.escrivivir.co` en el Caddy frontal existente.
2. Usar un Caddy frontal único en una composición superior y dejar los backends internos sin puertos públicos.

El bloque de `pub.escrivivir.co` no debe modificarse salvo para convivir en el mismo Caddyfile. La auth del nuevo servicio debe vivir solo bajo `scriptorium.escrivivir.co`.

### Fase 3 — Server seguro aparte

Crear un server nuevo en vez de modificar el existente.

Responsabilidades del nuevo server:

- Express + Socket.IO.
- CORS con allowlist desde `MCP_CHANNELS_CORS_ORIGINS`.
- Socket.IO Admin UI con auth basic bcrypt.
- Middleware Socket.IO runtime con `MCP_CHANNELS_TOKEN`.
- Middleware REST para `/mesh/*` con Bearer token.
- Health endpoint seguro.
- Reutilizar tipos/utilidades existentes cuando sea posible, pero sin editar clases base.

Opciones de implementación futura:

1. Copiar/componer la lógica necesaria de `SocketIoMeshLogics` en `SecureSocketIoMeshLogics`.
2. Extender clases existentes solo si no obliga a modificar sus constructores ni exports.
3. Si extender no permite sustituir auth/CORS a tiempo, crear implementación paralela mínima para el VPS.

### Fase 4 — Cliente remoto aparte

No modificar `mcp-core-sdk/src/client/SocketClient.ts` ni `AlephScriptClient.ts`.

Crear una clase/factory separada que preserve compatibilidad:

- `RemoteAlephScriptClient`
- `RemoteSocketClient`
- `createRemoteAlephScriptClient()`

Estrategia viable sin tocar el cliente base:

1. Construir el cliente base con `autoConnect = false`.
2. Configurar `client.io.auth = { token }` antes de conectar.
3. Aplicar namespace remoto `/runtime`.
4. Conectar manualmente cuando ya está configurado.
5. Leer defaults desde env en el wrapper, no en la clase base.

Variables recomendadas:

- `MCP_SOCKET_URL=https://scriptorium.escrivivir.co`
- `MCP_SOCKET_NAMESPACE=/runtime`
- `MCP_SOCKET_TOKEN=<token>`
- `MCP_SOCKET_PATH=/socket.io`
- `MCP_SOCKET_TRANSPORTS=websocket,polling`

Mantener compatibilidad con usos existentes de `SOCKET_MESH_URL`, pero solo en el wrapper nuevo.

### Fase 5 — Build Docker reproducible

El build debe resolver la dependencia local al paquete `@alephscript/mcp-core-sdk` sin depender de artefactos manuales no versionados.

Problema detectado:

- `mcp-channels-sdk/ws-server/package.json` referencia `../../mcp-core-sdk/alephscript-mcp-core-sdk-1.3.0.tgz`.
- Ese `.tgz` no estaba presente en la inspección.

Plan no invasivo:

1. En el Dockerfile nuevo, construir `mcp-core-sdk`.
2. Empaquetar `mcp-core-sdk` durante el build.
3. Instalar el paquete generado en el nuevo `remote-server`.
4. No modificar `package.json` existentes si se puede evitar.

### Fase 6 — Deploy VPS-GANDI

Usar el layout existente del patrón GANDI:

- Repo: `/opt/oasis-scriptorium`
- Estado: `/srv/oasis`
- Nuevo estado channels: `/srv/oasis/mcp-channels/`

Crear en el VPS un `.env` no versionado para Scriptorium Channels:

- host público
- puerto interno
- token runtime/API
- admin username
- admin password bcrypt
- CORS origins
- rutas de volúmenes

Usar la misma clave SSH operativa para desplegar si ya es la clave autorizada del VPS.

## Variables de entorno propuestas

### VPS/server

- `SCRIPTORIUM_CHANNELS_HOST=scriptorium.escrivivir.co`
- `MCP_CHANNELS_PORT=3010`
- `MCP_CHANNELS_TOKEN=<generar-secreto-nuevo>`
- `MCP_CHANNELS_ADMIN_USERNAME=admin`
- `MCP_CHANNELS_ADMIN_PASSWORD_BCRYPT=<bcrypt-hash>`
- `MCP_CHANNELS_CORS_ORIGINS=https://scriptorium.escrivivir.co,http://localhost:3000,http://localhost:5173`
- `MCP_CHANNELS_NODE_ENV=production`
- `MCP_CHANNELS_DATA_DIR=/srv/oasis/mcp-channels/data`
- `MCP_CHANNELS_LOGS_DIR=/srv/oasis/mcp-channels/logs`
- `MCP_CHANNELS_CADDY_DATA_DIR=/srv/oasis/mcp-channels/caddy-data`
- `MCP_CHANNELS_CADDY_CONFIG_DIR=/srv/oasis/mcp-channels/caddy-config`

### Cliente local

- `MCP_SOCKET_URL=https://scriptorium.escrivivir.co`
- `MCP_SOCKET_NAMESPACE=/runtime`
- `MCP_SOCKET_TOKEN=<mismo-token-runtime-o-token-rotado>`
- `MCP_SOCKET_PATH=/socket.io`
- `MCP_SOCKET_TRANSPORTS=websocket,polling`

## Archivos de referencia ya existentes

- `PATTERN/OASIS_PUB/docker-compose.pub.yml` — patrón compose con Caddy, red, env obligatorias y healthcheck.
- `PATTERN/OASIS_PUB/caddy/Caddyfile` — patrón de reverse proxy HTTPS/static.
- `PATTERN/OASIS_PUB/.env.vps.example` — patrón de `.env` VPS con placeholders.
- `PATTERN/GANDI_DEVOPS_FOLDER/README.md` — layout `/opt/oasis-scriptorium` y `/srv/oasis`, uso de SSH y bootstrap.
- `PATTERN/GANDI_DEVOPS_FOLDER/scripts/bootstrap-debian13-base.sh` — preparación Debian/GANDI.
- `PATTERN/GANDI_DEVOPS_FOLDER/scripts/verify-debian13-base.sh` — validación de base VPS.
- `mcp-core-sdk/src/server/SocketIoMesh.ts` — Express, CORS abierto actual, static `/ui`, arranque HTTP.
- `mcp-core-sdk/src/server/SocketIoMeshLogics.ts` — endpoints `/mesh`, `/mesh/rooms`, `/mesh/capabilities`, `/mesh/invoke`, `/mesh/health`.
- `mcp-core-sdk/src/server/SocketServer.ts` — admin UI instrumentada actualmente con `auth: false`; usar como referencia, no modificar.
- `mcp-channels-sdk/socket.io-admin-ui-develop/lib/index.ts` — soporte nativo de auth basic bcrypt para Admin UI.
- `mcp-core-sdk/src/client/SocketClient.ts` — cliente base actual; usar como referencia, no modificar.
- `mcp-core-sdk/src/client/AlephScriptClient.ts` — cliente AlephScript actual; usar como referencia, no modificar.
- `mcp-core-sdk/src/types/browser/index.ts` — `AlephClientConfig`; usar como referencia, no modificar en este plan.
- `mcp-channels-sdk/ws-server/packages/socket-gym-demo/src/index.ts` — demo actual con `mesh.init(3010)`; usar como referencia, no modificar.
- `mcp-channels-sdk/ws-server/packages/aleph-script-core-browser/src/client/SocketClient.ts` — referencia útil de config por objeto, transports y reconnection.
- `mcp-inspector-sdk/server/src/index.ts` — referencia de auth token con comparación timing-safe.

## Verificación esperada

### DNS y Caddy

1. `pub.escrivivir.co` sigue resolviendo y sirviendo la web pública sin pedir auth.
2. `scriptorium.escrivivir.co` resuelve a la misma IP pública.
3. Caddy emite/renueva certificados separados para ambos hosts.
4. La auth de `scriptorium.escrivivir.co` no aparece en `pub.escrivivir.co`.
5. Solo hay un proceso/servicio frontal ocupando `80` y `443`.

### Docker

1. El compose nuevo construye sin depender de `.tgz` manual ausente.
2. `channels-server` arranca en red interna.
3. `3010` no está expuesto públicamente.
4. Healthcheck interno responde.
5. Logs y datos se escriben bajo `/srv/oasis/mcp-channels/`.

### Auth runtime/API

1. `/mesh/rooms` sin token devuelve 401/403.
2. `/mesh/rooms` con token devuelve estado.
3. Cliente Socket.IO sin token falla con `connect_error`.
4. Cliente Socket.IO con token conecta a `/runtime`.
5. El token no aparece en logs.

### Admin UI

1. `/ui` carga bajo `https://scriptorium.escrivivir.co/ui`.
2. Admin namespace rechaza credenciales incorrectas.
3. Admin namespace acepta usuario + password que matchea el hash bcrypt.
4. La UI permite observar namespaces/sockets sin exponer el runtime sin auth.

### No regresión

1. No hay modificaciones en archivos existentes de core/client/server.
2. El PUB OASIS sigue funcionando igual.
3. Los usos existentes de `new AlephScriptClient(serverName, socketUrl)` no se ven afectados.
4. El demo `socket-gym-demo` conserva su comportamiento local.

## Decisiones finales

- Sí se puede usar el mismo VPS para `pub.escrivivir.co` y `scriptorium.escrivivir.co`.
- Sí se puede usar la misma clave SSH operativa para desplegar en ese VPS.
- No se reutilizan secretos de aplicación: el token MCP Channels y el hash admin son nuevos.
- La auth no afecta al PUB si se aplica solo al host/rutas de Scriptorium en Caddy y al nuevo backend.
- No se toca código existente; se crean componentes nuevos y patrones separados.
- La primera implementación debe priorizar aislamiento y reversibilidad sobre integración profunda.

## Próximo paso recomendado

Cuando se pase de plan a implementación, empezar por crear solo documentación/patrón de despliegue y un server seguro separado. Después validar DNS/Caddy con una respuesta `/mesh/health` mínima antes de conectar clientes reales.
