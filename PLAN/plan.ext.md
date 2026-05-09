# Plan extendido: auth para DevOps dinámico y MCP Launcher

Fecha: 2026-05-02  
Estado: extensión de planificación; implementación pendiente.  
Relación: complementa `PLAN/PLAN.MD` sin sustituirlo.  
Restricción mantenida: no tocar código existente; extender o crear componentes aparte.

## Resumen ejecutivo

Este lote añade dos superficies críticas al plan de auth de Scriptorium Channels:

1. `mcp-mesh-sdk/src/DevOpsServerImpl.ts`  
   Servidor DevOps con contenido MCP dinámico y persistente. Permite que agentes creen, editen y eliminen definiciones de prompts y resources mediante herramientas MCP.

2. `mcp-mesh-sdk/src/MCPLauncherServer.ts`  
   Lanzador/control plane de servidores MCP. Puede arrancar, parar, reiniciar y monitorizar procesos MCP, además de generar configuración para VS Code.

Ambos deben considerarse de alto riesgo si se exponen fuera de localhost o de una red de confianza. La estrategia recomendada sigue siendo no invasiva: crear wrappers, entrypoints seguros y configuración de despliegue separada, usando como referencia el patrón de auth de `mcp-inspector-sdk`.

## Respuesta rápida: ¿mcp-inspector-sdk soporta auth?

Sí, pero con un matiz importante.

`mcp-inspector-sdk` soporta auth en dos sentidos distintos:

1. **Auth del proxy Inspector**  
   El proxy del Inspector exige autenticación por defecto mediante `X-MCP-Proxy-Auth: Bearer <token>`. El token se genera automáticamente o se fija con `MCP_PROXY_AUTH_TOKEN`. La comparación se hace con `timingSafeEqual`. Solo se desactiva con `DANGEROUSLY_OMIT_AUTH`, marcado como peligroso.

2. **Reenvío de auth hacia servidores MCP objetivo**  
   El Inspector puede reenviar `Authorization`, headers `mcp-*`, `last-event-id` y headers custom indicados por `x-custom-auth-header` o `x-custom-auth-headers`. Esto permite probar servidores MCP que ya implementen Bearer/API key.

Conclusión: el Inspector **sí trae un patrón válido para proxy auth y forwarding de headers**, pero **no añade automáticamente auth server-side a nuestros servidores `mcp-mesh-sdk`**. Para `BaseMCPServer`, `DevOpsServerImpl` y `MCPLauncherServer`, la auth hay que implementarla en un wrapper/middleware propio o en un entrypoint seguro aparte.

## Hallazgos de código

### Base común: `BaseMCPServer`

`mcp-mesh-sdk/src/BaseMCPServer.ts` expone actualmente:

- `GET /health`
- `GET /`
- `POST /`
- `POST /mcp`
- `GET /mcp` con 405
- endpoints legacy:
  - `GET /resources/:resourceId`
  - `POST /tools/:toolName`
  - `POST /prompts/:promptId`

No se observa middleware de auth ni validación de origin en esta base. Por tanto, cualquier servidor que herede de `BaseMCPServer` queda abierto en el puerto donde escuche, salvo que se proteja por red, reverse proxy o wrapper.

### Caso 1: `DevOpsServerImpl.ts`

`DevOpsServer` hereda de `BaseMCPServer` y añade:

- `PersistentContentManager`
- `CRUDToolsManager`
- `CoreComponentsManager`
- `DevOpsPluginManager`
- `ProserpinaBot` como cliente Socket.IO hacia el mesh AlephScript.

El punto sensible es `CRUDToolsManager.registerAllTools()`, porque registra herramientas que modifican contenido MCP dinámico:

- `list_prompts`
- `add_prompt`
- `edit_prompt`
- `delete_prompt`
- `get_prompt`
- `list_resources`
- `add_resource`
- `edit_resource`
- `delete_resource`
- `get_resource`

El contenido se persiste vía `PersistentContentManager`, en la familia de rutas `ARCHIVO/PLUGINS/MCP_DATA/{serverName}/`, con prompts y resources en disco. Esto convierte al DevOps server en un **control plane de definición MCP mutable**.

Riesgo principal: si un agente o cliente no autorizado puede llamar `add_prompt`, `edit_prompt`, `add_resource` o `edit_resource`, puede alterar el comportamiento visible del servidor MCP de forma persistente.

### Caso 2: `MCPLauncherServer.ts`

`MCPLauncherServer` también hereda de `BaseMCPServer` y registra herramientas de control de procesos:

- `launch_mcp_server`
- `stop_mcp_server`
- `restart_mcp_server`
- `launch_all_servers`
- `health_check_servers`
- `check_port_availability`
- `generate_vscode_mcp_config`

También puede aceptar `customConfig` con:

- `port`
- `args`
- `env`
- `autoRestart`

Y lanza procesos con `spawn(npx tsx <script>)`, además de poder matar árboles de procesos con `taskkill` en Windows o process group kill en Unix.

Riesgo principal: este servidor es un **control plane operativo**. Expuesto sin auth equivale a permitir arranque/parada/reinicio de servidores y potencial manipulación de entorno de procesos.

### Drivers MCP

`IMCPDriver` y `MCPTypes` ya contemplan campos como:

- `headers?: Record<string, string>`
- `apiKey?: string`

Pero el adapter leído (`MCPDriverAdapter`) es un wrapper mínimo de `MCPClientDriver`. Este lote no debe asumir que la propagación de headers esté completa hasta validar `MCPClientDriver`. La planificación debe reservar una fase para comprobar y, si hace falta, extender un driver seguro aparte.

## Modelo de seguridad recomendado

### Principio 1: separar planos

Separar servidores por nivel de riesgo:

1. **Plano público / lectura mínima**
   - health público reducido
   - status no sensible
   - documentación estática

2. **Plano runtime protegido**
   - herramientas MCP normales
   - clientes autorizados
   - Bearer token o mTLS

3. **Plano admin/control**
   - DevOps dynamic definitions
   - Launcher
   - reinicios, arranques, edición persistente
   - solo localhost, túnel VS Code/SSH, VPN o mTLS fuerte

### Principio 2: scopes por capacidad

No basta un token único para todo si exponemos DevOps y Launcher. Usar scopes lógicos:

- `mesh:read`
- `mesh:invoke`
- `devops:read`
- `devops:write-definitions`
- `devops:delete-definitions`
- `launcher:read`
- `launcher:control`
- `launcher:spawn`
- `admin:*`

Para MVP se puede empezar con tokens separados por rol:

- `MCP_PUBLIC_STATUS_TOKEN` opcional
- `MCP_RUNTIME_TOKEN`
- `MCP_DEVOPS_ADMIN_TOKEN`
- `MCP_LAUNCHER_ADMIN_TOKEN`

### Principio 3: deny-by-default

Los endpoints peligrosos deben quedar cerrados por defecto.

Reglas mínimas:

- `/health` puede devolver solo estado básico y no requerir auth si está detrás de Caddy y no revela detalles.
- `/`, `/mcp`, `/tools/*`, `/prompts/*`, `/resources/*` deben requerir auth en despliegue remoto.
- Las herramientas `add_*`, `edit_*`, `delete_*` deben exigir scope de escritura.
- Las herramientas `launch_*`, `stop_*`, `restart_*` deben exigir scope admin/control.
- `generate_vscode_mcp_config` no debe filtrar URLs internas ni tokens.

## Enfoque no invasivo

No modificar directamente:

- `mcp-mesh-sdk/src/BaseMCPServer.ts`
- `mcp-mesh-sdk/src/DevOpsServerImpl.ts`
- `mcp-mesh-sdk/src/MCPLauncherServer.ts`
- `mcp-mesh-sdk/src/managers/CRUDToolsManager.ts`
- `mcp-mesh-sdk/src/managers/PersistentContentManager.ts`
- `mcp-mesh-sdk/src/drivers/MCPDriverAdapter.ts`

Crear componentes nuevos:

1. `mcp-mesh-sdk/src/security/` o paquete paralelo equivalente
   - `AuthPolicy.ts`
   - `BearerTokenVerifier.ts`
   - `ScopedAuthMiddleware.ts`
   - `ToolScopePolicy.ts`

2. Entry points seguros aparte
   - `SecureDevOpsServer.ts`
   - `SecureMCPLauncherServer.ts`
   - `SecureBaseMCPServerWrapper.ts`

3. Patrón de despliegue separado
   - `PATTERN/SCRIPTORIUM_CHANNELS/`
   - o subcarpeta `PATTERN/SCRIPTORIUM_CHANNELS/devops-control-plane/`

4. Configuración `.env` no versionada
   - tokens por rol
   - allowed origins
   - flags para publicar o no cada superficie

## Diseño propuesto para auth server-side

### Middleware HTTP estilo Inspector

Inspirarse en `mcp-inspector-sdk/server/src/index.ts`:

- token desde env
- header Bearer
- comparación timing-safe
- error 401 uniforme
- origin allowlist
- posibilidad de desactivar solo en local con flag ruidoso y peligroso

Diferencias recomendadas:

- Usar `Authorization: Bearer <token>` como estándar para nuestros servidores.
- Aceptar `X-MCP-Auth` o `X-MCP-Proxy-Auth` solo como compatibilidad opcional.
- Nunca meter tokens en logs.
- No aceptar `DANGEROUSLY_OMIT_AUTH` en producción.

Variables:

- `MCP_AUTH_ENABLED=true`
- `MCP_ALLOWED_ORIGINS=https://scriptorium.escrivivir.co,http://localhost:6274`
- `MCP_RUNTIME_TOKEN=<secret>`
- `MCP_DEVOPS_ADMIN_TOKEN=<secret>`
- `MCP_LAUNCHER_ADMIN_TOKEN=<secret>`
- `MCP_AUTH_ALLOW_LOCAL_BYPASS=false`

### Policy por ruta

Ejemplo conceptual:

| Ruta | Scope mínimo |
|---|---|
| `GET /health` | público reducido o `mesh:read` |
| `GET /` | `mesh:read` |
| `POST /` | `mesh:invoke` |
| `POST /mcp` | `mesh:invoke` |
| `GET /resources/*` | `mesh:read` |
| `POST /prompts/*` | `mesh:invoke` |
| `POST /tools/*` | depende del tool |

### Policy por tool

DevOps:

| Tool | Scope mínimo |
|---|---|
| `list_prompts` | `devops:read` |
| `get_prompt` | `devops:read` |
| `add_prompt` | `devops:write-definitions` |
| `edit_prompt` | `devops:write-definitions` |
| `delete_prompt` | `devops:delete-definitions` |
| `list_resources` | `devops:read` |
| `get_resource` | `devops:read` |
| `add_resource` | `devops:write-definitions` |
| `edit_resource` | `devops:write-definitions` |
| `delete_resource` | `devops:delete-definitions` |

Launcher:

| Tool | Scope mínimo |
|---|---|
| `get_server_status` | `launcher:read` |
| `health_check_servers` | `launcher:read` |
| `check_port_availability` | `launcher:read` |
| `generate_vscode_mcp_config` | `launcher:read` con sanitización |
| `launch_mcp_server` | `launcher:control` / `launcher:spawn` |
| `launch_all_servers` | `launcher:control` |
| `stop_mcp_server` | `launcher:control` |
| `restart_mcp_server` | `launcher:control` |

## Reverse proxy y exposición recomendada

### DevOps dinámico

No exponer directamente.

Opciones:

1. Solo `127.0.0.1` + VS Code Port Forwarding.
2. Subruta privada detrás de Caddy con mTLS:
   - `https://scriptorium.escrivivir.co/admin/devops/mcp`
3. VPN/Tailscale/WireGuard para administración.

### Launcher

Más restrictivo que DevOps.

Recomendación MVP:

- No publicar en Internet.
- Ejecutar solo en el VPS como servicio interno.
- Acceso por túnel SSH/VS Code.
- Si se expone, hacerlo solo con mTLS y token admin separado.

### Caddy

Separación por host y ruta:

- `pub.escrivivir.co` sin auth global.
- `scriptorium.escrivivir.co` runtime protegido.
- `scriptorium.escrivivir.co/admin/*` con mTLS o basic_auth adicional.

No aplicar auth global al Caddy frontal si comparte el pub público.

## Dockerización VPS para DevOps y Launcher

### Objetivo de este lote Docker

El despliegue VPS debe convertir `DevOpsServerImpl` y `MCPLauncherServer` en servicios administrables por Docker, sin dejar puertos MCP expuestos directamente al host público y conservando la persistencia compartida de `ARCHIVO/PLUGINS`.

La idea base:

- Caddy sigue siendo el único frontal público en `80/443`.
- Los servidores MCP viven en una red Docker interna.
- Los puertos MCP no se publican con `0.0.0.0:3003`, `0.0.0.0:3050`, etc.
- Si hace falta acceder desde el host, usar bind a `127.0.0.1` o túnel VS Code/SSH.
- `ARCHIVO/PLUGINS` se monta como volumen persistente compartido en todos los contenedores MCP que necesiten estado.

### Mapa de puertos actual

Según las configs de `mcp-mesh-sdk/src/configs`:

| Servicio | Config id | Script | Puerto actual |
|---|---|---|---|
| Launcher | `mcp-service-launcher` | `src/MCPLauncherServer.ts` | `3050` |
| DevOps | `devops-mcp-server` | `src/DevOpsServer.ts` | `3003` |
| Wiki | `wiki-mcp-browser` | `src/MCPWikiBrowserServer.ts` | `3002` |
| State Machine | `state-machine-server` | `src/MCPStateMachineServer.ts` | `3004` |
| Prolog | `prolog-mcp-server` | `src/MCPPrologServer.ts` | `3006` |
| AAIA | `aaia-mcp-server` | `src/MCPAAIAServer.ts` | `3007` |
| Firehose | `firehose-mcp-server` | `src/MCPFirehoseServer.ts` | `3008` |
| TypedPrompt | `typed-prompt-mcp-server` | `src/MCPTypedPromptServer.ts` | `3020` |
| BotHub | `bothub-mcp-server` | `src/MCPBotHubServer.ts` | `3010` |

Estos puertos deben ser **internos de Docker** por defecto. La publicación hacia Internet se hace por rutas Caddy y solo para superficies aprobadas.

### Problema del launcher con `spawn`

El launcher actual usa `spawn(npx tsx <script>)` dentro del proceso Node. En local esto funciona porque todos los puertos quedan en la misma máquina. En Docker/VPS, si mantenemos ese patrón tal cual, ocurren varios problemas:

1. Los procesos hijos quedan dentro del contenedor del launcher, no como servicios Docker independientes.
2. Docker no puede reiniciar, observar ni healthcheckear cada servidor hijo por separado.
3. Todos los puertos hijos viven dentro del mismo network namespace del contenedor launcher.
4. Es fácil acabar con procesos huérfanos o estados que Docker no entiende.
5. Si se publica un rango de puertos del launcher, se amplía demasiado la superficie expuesta.
6. `customConfig.env` y `customConfig.args` se vuelven más peligrosos, porque alteran procesos internos no aislados.

Conclusión: para VPS, el launcher no debería seguir siendo un `spawn` libre. Debe evolucionar a uno de estos modelos.

### Modelo recomendado: launcher como orquestador declarativo de Compose

El modelo recomendado para producción es que cada servidor MCP sea un servicio Docker separado, y que el launcher deje de hacer `spawn` directo para convertirse en un **orquestador declarativo**.

En vez de:

```text
launcher -> spawn(npx tsx src/MCPPrologServer.ts) -> puerto 3006 en el mismo contenedor
```

Usar:

```text
launcher -> solicita start/stop/restart -> Docker Compose service prolog-mcp -> puerto 3006 interno
```

Servicios Docker propuestos:

- `mcp-launcher-admin` → puerto interno `3050`
- `mcp-devops-admin` → puerto interno `3003`
- `mcp-wiki` → puerto interno `3002`
- `mcp-state` → puerto interno `3004`
- `mcp-prolog` → puerto interno `3006`
- `mcp-aaia` → puerto interno `3007`
- `mcp-firehose` → puerto interno `3008`
- `mcp-typed-prompt` → puerto interno `3020`
- `mcp-bothub` → puerto interno `3010` solo si se activa perfil BotHub

El launcher en Docker debería trabajar contra una allowlist de servicios, no contra scripts arbitrarios.

Acciones permitidas:

- `start serviceId`
- `stop serviceId`
- `restart serviceId`
- `status serviceId`
- `health serviceId`

Acciones no permitidas en producción:

- pasar scripts arbitrarios
- pasar args arbitrarios
- pasar variables env arbitrarias
- montar nuevos paths desde request MCP

### Alternativa MVP sin Docker socket

Para evitar montar `/var/run/docker.sock`, que es muy poderoso, se puede empezar con un MVP más simple:

1. `docker compose` declara todos los servidores MCP como servicios.
2. Los servicios no críticos usan `profiles`.
3. El despliegue arranca un conjunto fijo:
    - `mcp-devops-admin`
    - `mcp-launcher-admin`
    - servidores requeridos por el stack
4. El launcher deja de lanzar procesos en VPS y queda en modo observabilidad/control limitado.
5. Las acciones de start/stop/restart reales se ejecutan por script DevOps externo o por CI/CD, no por herramienta MCP remota.

Este MVP es más seguro porque el launcher no necesita Docker socket.

### Alternativa con Docker socket, solo si hace falta

Si se necesita que el launcher controle contenedores desde MCP, montar `/var/run/docker.sock` solo en `mcp-launcher-admin` y asumir que ese contenedor equivale a root del host Docker.

Mitigaciones obligatorias:

- `LAUNCHER_DOCKER_MODE=true`
- allowlist cerrada de servicios Compose
- sin `customConfig.env` salvo claves allowlisted
- sin `customConfig.args` salvo valores allowlisted
- token admin separado
- acceso solo por túnel/VPN/mTLS
- auditoría JSONL de cada acción
- nunca exponer `mcp-launcher-admin` públicamente sin doble barrera

En producción, si se usa Docker socket, el launcher debe controlar **servicios**, no ejecutar comandos shell.

### Gestión de puertos en Docker

Regla principal: `expose` sí, `ports` no, salvo para bind local o Caddy.

Ejemplo conceptual:

```yaml
services:
   mcp-devops-admin:
      expose:
         - "3003"
      networks:
         - scriptorium_mcp_net

   mcp-launcher-admin:
      expose:
         - "3050"
      networks:
         - scriptorium_mcp_net
```

No hacer esto en VPS:

```yaml
ports:
   - "3003:3003"
   - "3050:3050"
```

Si se necesita acceso desde VS Code Remote/SSH, usar bind local:

```yaml
ports:
   - "127.0.0.1:3050:3050"
   - "127.0.0.1:3003:3003"
```

Si se necesita acceso HTTPS por host/ruta, Caddy debe estar en la misma red Docker y hacer reverse proxy por nombre de servicio:

```text
scriptorium.escrivivir.co/admin/devops/*   -> mcp-devops-admin:3003
scriptorium.escrivivir.co/admin/launcher/* -> mcp-launcher-admin:3050
```

Pero la recomendación para `launcher` sigue siendo no publicarlo ni siquiera por Caddy, salvo túnel o mTLS.

### Red Docker propuesta

Crear una red bridge privada:

- `scriptorium_mcp_net`

Todos los MCP internos se comunican por DNS Docker:

- `http://mcp-devops-admin:3003`
- `http://mcp-launcher-admin:3050`
- `http://mcp-prolog:3006`
- etc.

El `url` que hoy aparece como `http://localhost` en configs debe cambiar en perfil Docker a URL interna por servicio. No conviene que un contenedor llame a `localhost` esperando encontrar otro servicio, porque `localhost` dentro de Docker es el propio contenedor.

Para no tocar configs existentes, crear un archivo de config Docker aparte o un adapter de runtime que reescriba URLs:

- `mcp-mesh-sdk/configs/docker.app.config.ts`
- `PATTERN/SCRIPTORIUM_CHANNELS/config/mcp/servers.docker.json`
- o variables env por servicio.

### Persistencia: montar `ARCHIVO/PLUGINS`

`FilePersistenceManager.getDefaultDataDir()` calcula por defecto:

```text
<workspaceRoot>/ARCHIVO/PLUGINS/MCP_DATA
```

Y `PersistentContentManager` documenta:

```text
ARCHIVO/PLUGINS/MCP_DATA/{serverName}/
   prompts/
   resources/
   _metadata.json
```

Además, otros servidores usan rutas bajo `ARCHIVO/PLUGINS`, por ejemplo:

- `BOT_HUB_SDK/data`
- `PROLOG_EDITOR/templates`
- y otros stores específicos de plugins.

Por tanto, en VPS hay que montar la carpeta completa `ARCHIVO/PLUGINS`, no solo `MCP_DATA`.

Recomendación de ruta host:

```text
/srv/oasis/scriptorium/ARCHIVO/PLUGINS
```

Ruta dentro de contenedor:

```text
/workspace/ARCHIVO/PLUGINS
```

Y ejecutar los contenedores con layout estable:

```text
/workspace/mcp-mesh-sdk
/workspace/mcp-core-sdk
/workspace/ARCHIVO/PLUGINS
```

Montaje Compose conceptual:

```yaml
volumes:
   - "${SCRIPTORIUM_PLUGINS_DIR:-/srv/oasis/scriptorium/ARCHIVO/PLUGINS}:/workspace/ARCHIVO/PLUGINS"
```

Con esto, `ARCHIVO/PLUGINS/MCP_DATA/devops-mcp-server` queda persistente en el host.

### Volúmenes mínimos

Para el patrón Docker VPS:

- `SCRIPTORIUM_PLUGINS_DIR=/srv/oasis/scriptorium/ARCHIVO/PLUGINS`
- `SCRIPTORIUM_LOGS_DIR=/srv/oasis/scriptorium/logs`
- `SCRIPTORIUM_AUDIT_DIR=/srv/oasis/scriptorium/audit`
- `SCRIPTORIUM_CONFIG_DIR=/srv/oasis/scriptorium/config`
- `SCRIPTORIUM_CADDY_DATA_DIR=/srv/oasis/scriptorium/caddy-data` si Caddy propio
- `SCRIPTORIUM_CADDY_CONFIG_DIR=/srv/oasis/scriptorium/caddy-config` si Caddy propio

Montajes recomendados:

| Host | Contenedor | Uso |
|---|---|---|
| `/srv/oasis/scriptorium/ARCHIVO/PLUGINS` | `/workspace/ARCHIVO/PLUGINS` | persistencia plugins/MCP_DATA |
| `/srv/oasis/scriptorium/logs` | `/workspace/logs` | logs app |
| `/srv/oasis/scriptorium/audit` | `/workspace/audit` | auditoría auth/control |
| `/srv/oasis/scriptorium/config` | `/workspace/config:ro` | configs runtime |

### Dockerfile base propuesto

Crear una imagen base para `mcp-mesh-sdk`:

- Node 22 alpine o slim.
- `WORKDIR /workspace/mcp-mesh-sdk`.
- Copiar `mcp-mesh-sdk` y `mcp-core-sdk`.
- Resolver el problema del `.tgz` local de `@alephscript/mcp-core-sdk` durante build.
- Ejecutar `npm ci` o `npm install` según lockfile disponible.
- Build TypeScript si se ejecutará `node dist/...`.
- Alternativa MVP: ejecutar `tsx src/...` dentro del contenedor, más simple pero menos producción.

Problema a resolver:

```text
"@alephscript/mcp-core-sdk": "file:../mcp-core-sdk/alephscript-mcp-core-sdk-1.3.0.tgz"
```

El Dockerfile debe generar ese paquete o instalar desde el path local real. No depender de un `.tgz` manual no versionado.

### Compose VPS propuesto

Crear un patrón nuevo:

```text
PATTERN/SCRIPTORIUM_CHANNELS/docker-compose.mcp-admin.yml
PATTERN/SCRIPTORIUM_CHANNELS/.env.mcp-admin.example
PATTERN/SCRIPTORIUM_CHANNELS/caddy/Caddyfile.mcp-admin
PATTERN/SCRIPTORIUM_CHANNELS/scripts/deploy-mcp-admin.sh
PATTERN/SCRIPTORIUM_CHANNELS/scripts/verify-mcp-admin.sh
```

Artefactos creados para este lote:

- `PATTERN/SCRIPTORIUM_CHANNELS/README.md`
- `PATTERN/SCRIPTORIUM_CHANNELS/Dockerfile.mcp-mesh`
- `PATTERN/SCRIPTORIUM_CHANNELS/docker-compose.mcp-admin.yml`
- `PATTERN/SCRIPTORIUM_CHANNELS/.env.mcp-admin.example`
- `PATTERN/SCRIPTORIUM_CHANNELS/caddy/Caddyfile.mcp-admin`
- `PATTERN/SCRIPTORIUM_CHANNELS/scripts/deploy-mcp-admin.sh`
- `PATTERN/SCRIPTORIUM_CHANNELS/scripts/verify-mcp-admin.sh`
- `PATTERN/SCRIPTORIUM_CHANNELS/scripts/down-mcp-admin.sh`

Nota importante: el compose creado no arranca `mcp-launcher-admin` por defecto. El código actual de `MCPLauncherServer` llama `launchAllServers(true)` al iniciar, por lo que en VPS queda bajo profile explícito `launcher-legacy` hasta crear un modo seguro `docker-service` u `observe` que no haga `spawn` libre.

Servicios mínimos del compose:

- `mcp-devops-admin`
- `mcp-launcher-admin` solo bajo profile `launcher-legacy` mientras no exista wrapper seguro
- opcionalmente `mcp-prolog`, `mcp-wiki`, `mcp-state`, etc. por profiles

Perfiles recomendados:

- `core`: devops + launcher
- `logic`: prolog + typed-prompt
- `agents`: aaia + state
- `network`: firehose + bothub
- `all`: todos

### Configuración del launcher en Docker

El launcher debe tener dos modos:

1. **Legacy local mode**
    - usa `spawn`
    - solo desarrollo local
    - `LAUNCHER_MODE=spawn`
    - no permitido en VPS salvo laboratorio aislado

2. **Docker service mode**
    - no usa scripts arbitrarios
    - controla servicios Compose allowlisted
    - `LAUNCHER_MODE=docker-service`
    - recomendado para VPS

En modo Docker service, el `serverId` se mapea a servicio:

| serverId | compose service |
|---|---|
| `devops-mcp-server` | `mcp-devops-admin` |
| `prolog-mcp-server` | `mcp-prolog` |
| `typed-prompt-mcp-server` | `mcp-typed-prompt` |
| `aaia-mcp-server` | `mcp-aaia` |
| `wiki-mcp-browser` | `mcp-wiki` |
| `state-machine-server` | `mcp-state` |
| `firehose-mcp-server` | `mcp-firehose` |
| `bothub-mcp-server` | `mcp-bothub` |

### Control de exposición por Caddy

Rutas sugeridas:

```text
https://scriptorium.escrivivir.co/mcp/devops/*     -> mcp-devops-admin:3003
https://scriptorium.escrivivir.co/mcp/prolog/*     -> mcp-prolog:3006
https://scriptorium.escrivivir.co/mcp/typed/*      -> mcp-typed-prompt:3020
```

No recomendado como ruta pública:

```text
https://scriptorium.escrivivir.co/mcp/launcher/*
```

Para launcher:

- preferir `127.0.0.1:3050` + túnel SSH/VS Code
- o `/admin/launcher/*` con mTLS + Basic Auth + Bearer admin, si es imprescindible

### Healthchecks Docker

Cada servicio debe tener healthcheck interno:

```text
GET http://127.0.0.1:<port>/health
```

Ejemplos:

- DevOps: `3003/health`
- Launcher: `3050/health`
- Prolog: `3006/health`

El healthcheck no debe requerir token si solo corre dentro del contenedor, pero no debe revelar secretos.

### Reglas de seguridad Docker

Por defecto:

- `read_only: true` donde sea posible.
- Montar `ARCHIVO/PLUGINS` como rw solo en servidores que escriben.
- Montar configs como `:ro`.
- `no-new-privileges: true`.
- usuario no root si la imagen lo permite.
- no montar Docker socket salvo en modo launcher Docker service explícito.
- no publicar rangos de puertos.

Para DevOps:

- `ARCHIVO/PLUGINS` rw.
- audit rw.
- config ro.

Para Launcher:

- idealmente config ro + audit rw.
- sin `ARCHIVO/PLUGINS` rw salvo que también tenga herramientas que escriben.
- Docker socket solo si `LAUNCHER_MODE=docker-service` y con consciencia de riesgo.

### Decisión recomendada para el VPS

Para el primer despliegue seguro:

1. Dockerizar `mcp-devops-admin` como servicio separado.
2. Dockerizar `mcp-launcher-admin` como servicio separado, pero dejarlo en modo observabilidad o control limitado.
3. No permitir `spawn` en VPS.
4. No publicar `3003` ni `3050` a Internet.
5. Montar `/srv/oasis/scriptorium/ARCHIVO/PLUGINS` en `/workspace/ARCHIVO/PLUGINS`.
6. Usar Caddy solo para rutas MCP aprobadas.
7. Acceder al launcher por túnel VS Code/SSH al principio.

Esto evita el problema de “cada servidor levanta su puerto y queda expuesto”: en Docker los puertos quedan internos y solo Caddy o bind local decide qué sale al exterior.

## Integración con Inspector

### Uso de Inspector como cliente de pruebas

El Inspector puede probar servidores protegidos si se configuran headers:

- Proxy auth al Inspector:
  - `X-MCP-Proxy-Auth: Bearer <MCP_PROXY_AUTH_TOKEN>`
- Auth hacia servidor objetivo:
  - `Authorization: Bearer <MCP_RUNTIME_TOKEN>`
  - o header custom mediante `x-custom-auth-header`

Esto permite validar:

- 401 sin token.
- 200 con token correcto.
- Forwarding de headers en SSE/Streamable HTTP.
- Rechazo de origins no permitidos.

### Lo que Inspector no resuelve

- No protege `BaseMCPServer` si este se expone directamente.
- No decide scopes por tool.
- No restringe `launch_mcp_server` o `add_prompt` si el backend no valida permisos.

## Plan de implementación por fases

### Fase A — Documentar y aislar

1. Mantener este plan como contrato.
2. Confirmar qué servicios serán accesibles solo por túnel.
3. Definir tokens por rol en `.env` del VPS.
4. Confirmar si `DevOpsServer` y `Launcher` correrán en el mismo compose de Scriptorium Channels o en uno admin separado.

### Fase B — Wrapper de auth común

Crear un wrapper HTTP no invasivo que reciba una instancia de Express o un server ya construido y aplique:

- origin allowlist
- bearer token
- scope resolver
- redacción de logs
- deny-by-default

Si no es viable envolver `BaseMCPServer` sin tocarlo, crear `SecureBaseMCPServer` copiando la mínima lógica necesaria y documentando divergencias.

### Fase C — Secure DevOps

Crear entrypoint nuevo para DevOps:

- reutiliza `DevOpsServer` o una variante segura
- aplica policy por tool
- bloquea writes si no hay `MCP_DEVOPS_ADMIN_TOKEN`
- persiste auditoría mínima de cambios:
  - actor/token fingerprint
  - tool invocado
  - id de prompt/resource
  - timestamp

No registrar herramientas de escritura si `DEVOPS_DEFINITIONS_MUTABLE=false`.

### Fase D — Secure Launcher

Crear entrypoint nuevo para Launcher:

- no escucha en interfaz pública por defecto
- obliga `MCP_LAUNCHER_ADMIN_TOKEN`
- deshabilita `customConfig.env` salvo allowlist
- deshabilita `customConfig.args` salvo allowlist
- sanitiza `generate_vscode_mcp_config`
- registra auditoría de launch/stop/restart

### Fase E — Driver/cliente con headers

Validar `MCPClientDriver`.

Si no propaga `headers` o `apiKey`, crear driver seguro aparte:

- `SecureMCPClientDriver`
- inyecta `Authorization: Bearer <token>`
- soporta tokens por server id
- no loguea secretos

### Fase F — Validación con Inspector

Usar `mcp-inspector-sdk` como herramienta de prueba:

1. Arrancar Inspector con `MCP_PROXY_AUTH_TOKEN` fijo.
2. Conectar al servidor protegido sin token objetivo: debe fallar 401.
3. Conectar con `Authorization: Bearer <token>`: debe funcionar.
4. Probar tool read permitido.
5. Probar tool write con token runtime: debe fallar 403.
6. Probar tool write con token admin: debe funcionar.
7. Probar origin no permitido: debe fallar 403.

## Variables de entorno propuestas

### Comunes

- `MCP_AUTH_ENABLED=true`
- `MCP_ALLOWED_ORIGINS=https://scriptorium.escrivivir.co,http://localhost:6274,http://localhost:3000`
- `MCP_AUTH_HEADER=Authorization`
- `MCP_AUTH_COMPAT_HEADERS=X-MCP-Auth,X-MCP-Proxy-Auth`
- `MCP_RUNTIME_TOKEN=<secret>`
- `MCP_ADMIN_TOKEN=<secret>`

### DevOps

- `DEVOPS_AUTH_REQUIRED=true`
- `DEVOPS_DEFINITIONS_MUTABLE=false`
- `MCP_DEVOPS_ADMIN_TOKEN=<secret>`
- `DEVOPS_AUDIT_LOG=/srv/oasis/mcp-channels/audit/devops.jsonl`
- `DEVOPS_CONTENT_DIR=/srv/oasis/mcp-channels/devops-content`

### Launcher

- `LAUNCHER_AUTH_REQUIRED=true`
- `MCP_LAUNCHER_ADMIN_TOKEN=<secret>`
- `LAUNCHER_BIND_HOST=127.0.0.1`
- `LAUNCHER_ALLOW_CUSTOM_ENV=false`
- `LAUNCHER_ALLOWED_ENV_KEYS=MCP_SERVER_PORT,NODE_ENV,SOCKET_MESH_URL`
- `LAUNCHER_ALLOW_CUSTOM_ARGS=false`
- `LAUNCHER_AUDIT_LOG=/srv/oasis/mcp-channels/audit/launcher.jsonl`

### Inspector para pruebas

- `MCP_PROXY_AUTH_TOKEN=<secret>`
- `ALLOWED_ORIGINS=http://localhost:6274,https://scriptorium.escrivivir.co`
- No usar `DANGEROUSLY_OMIT_AUTH` salvo prueba local aislada.

## Criterios de aceptación

### Base HTTP

1. `POST /mcp` sin token devuelve 401 en despliegue seguro.
2. `POST /tools/list_prompts` con token read funciona.
3. `POST /tools/add_prompt` con token read falla 403.
4. `POST /tools/add_prompt` con token admin funciona y deja auditoría.
5. `GET /health` no revela rutas internas ni tokens.

### DevOps dinámico

1. Las herramientas de lectura quedan separadas de escritura.
2. `DEVOPS_DEFINITIONS_MUTABLE=false` impide registrar o ejecutar writes.
3. Los cambios persistentes quedan auditados.
4. El contenido persistente no se escribe fuera del directorio configurado.

### Launcher

1. No escucha en IP pública por defecto.
2. `launch_mcp_server`, `stop_mcp_server`, `restart_mcp_server` requieren token admin.
3. `customConfig.env` y `customConfig.args` están deshabilitados o allowlisted.
4. `generate_vscode_mcp_config` no imprime secretos.
5. Stop/restart/launch quedan auditados.

### Inspector

1. Proxy Inspector requiere `X-MCP-Proxy-Auth`.
2. Inspector puede reenviar `Authorization` al servidor MCP objetivo.
3. Sin token objetivo, el servidor protegido rechaza.
4. Con token objetivo correcto, el servidor protegido responde.

## Decisiones finales de este lote

- `mcp-inspector-sdk` confirma un patrón útil: token Bearer, auth por defecto, origin allowlist y forwarding de headers.
- `mcp-mesh-sdk` no debe considerarse protegido actualmente solo por heredar de `BaseMCPServer`.
- `DevOpsServerImpl` debe tratarse como control plane mutable de definiciones MCP.
- `MCPLauncherServer` debe tratarse como control plane operativo de procesos.
- Ambos deben quedar fuera de exposición pública directa.
- La implementación debe hacerse creando variantes/wrappers seguros, no modificando los archivos base existentes.

## Próximo paso recomendado

Antes de implementar código, crear el patrón de despliegue admin separado y decidir si el MVP expondrá DevOps/Launcher solo por túnel VS Code o también por `scriptorium.escrivivir.co/admin/*` con mTLS.
