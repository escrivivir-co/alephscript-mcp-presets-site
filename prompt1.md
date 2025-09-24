# Regeneración web

## Objetivo

Dado un sitio web, "asterion" crear una versión limpia y de producción llamada "zeus" que implemente, EXACTAMENTE, todas las caracteristicas y funcionalidades pero con el código refactorizado, sin comentarios en español (todo inglés), ni código legacy, duplicado. Etc. Además, contamos con "diogenes" que es un sitio web donde nuestro "zeus" se implantará (o bien standalone o bien integrada en diogenes).

En esta codebase tenemos los siguientes directorios:

- "asterion" (SOLO LECTURA): contiene el servidor/html para refactorizar. En principio todo funciona. Queremos preservar "exactamente" la misma funcionalidad aunque el código tiene graves problemas. Sobre todo una bifurcación a la hora de hidratar porque varios agentes han trabajado creando versiones tanto servidor como cliente; en este sentido, lo que hay ahora funciona y por tanto habrá que detectar primero, para cada vista qué se está usando y luego mirar y de portar homogéneamente.
- "zeus" (DIRECTORIO OBJETIVO): vacío, tu directorio de trabajo para para migrar la "web"
- "diogenes"" (SOLO LECTURA): es una web independiente donde nuestra nueva web deberá acoplarse (pero ese acople no lo haremos nosotros). Este acoplamiento será "moderado" en el sentido de que nuestra web corre en su servidor independiente, y mayormente, usando el mismo look&feel (themes templates) será a nivel de usuario que no distinguiría si está en una u en otra. Pero queremos que "zeus" use las mismas (o parecidas) estrategias y arquitecturas para facilitar en un futuro la absorción de zeus por parte el equipo de diogenes.Nuestra web, además consume algunas rutas REST de este sitio.

# Estructura

Nuestra asterion tiene estas vistas:

- Home: a modo de landing
- Settings: típica página que incluye el selector de tema.
- Librería de presets: a modo de catálogo, permite escoger el "preset" actual. 
- Presets Explorer (explorer, debería renombrarse a "Editor"): Permite crear presets. A partir de las rutas de diogenes, obtenemos un catálogo de servidores Model Context Protocol (MCP/Anthropic) y sus funcionalidades. Nuestro editor le permite al usuario combinar las tools/resources/prompts de los distintos servidores en un solo preset que luego usará para aportar contexto a consersacion con IA.
- AI Conversational (con presets): Permite chat e histórico (enviando posts a diogenes) que llevan el preset como contexto.

# Iteración 1

Descripción de la tarea: inspeccionar la codebase y generar un mapa de archivos para zeus.

Archivos de resultado:

- zeus\PLANIFICACION\estudio_asterion.md
- zeus\PLANIFICACION\estudio_diogenes.md
- zeus\PLANIFICACION\plan_zeus.md

## Parte 1: "diogenes"
Inspeccionar la arquitectura y mapa de ficheros de "diogenes" y crear un documento base que detalle los aspectos técnicos. Identificar los patrones y marco base típico de una web: index, internacionalización, logs, distribución y patrones de componentes, gestión de estilos, etc.

## Parte 2: "asterion"
Inspeccionar la arquitectura y mapa de ficheros de "asterion" y crear un documento base que detalle los aspectos técnicos. Identificar los patrones y marco base típico de una web: index, internacionalización, logs, distribución y patrones de componentes, gestión de estilos, etc.

Aquí, además, crear un listado de "bloquers" o "críticos".

## Parte 3: "zeus"

Habiendo conocido a diogenes y sabiendo que queremos "parecernos" al máximo a él; y habiendo visto con lo que contamos en "asterion" (sus vicios y virtudes); crea un mapa de ficheros para zeus que se parezca al máximo a diogenes y que tenga desde el punto de vista del usuario "exactamente" (o casi, puedes tomarte licencias si algo te complica o es excesivamente engorroso de portar) la misma funcionalidad que asterion (mismas vistas, mismos componentes, mismas capacidades). 

