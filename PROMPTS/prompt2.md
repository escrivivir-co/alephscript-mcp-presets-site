# Prompt2: Plan

## Objetivo

Siguiendo el hilo de prompt1.md:

- distribuir la carga de trabajo en fases y crear una checklist (fichero que se mantiene limpio de texto, contiene solo los checks y hace referencia a documentos externos pero no contiene información para mantenerse limpio y manejable)
- así como una plantilla de "iteración" de modo que para cada punto se específique al agente que debe usar su plantilla y partir/acabar en nuestra checklist. (hacemos scrum convencional pero con micro sprints que en lugar de proyectarse en los días del calendario se basan en la métrica de número de requests; es decir, cada sprint contiene un número de "request" que se hacen al agente coder encargado de completarlo).
- crea el archivo zeus\PLANIFICACION\VIBECODING\zeus_main_context_base.md como fichero "agents" para que los agentes puedan iniciar sesión y rápidamente identificar la iteración y entrar a colaborar.  instrucciones tanto de la "dinámica" de trabajo  como especifico de la técnica en zeus y la base a partir de diogenes y asterión.
- Crear directorio que usaran los agentes para agregar la hoja de su iteracion al historico: zeus\PLANIFICACION\VIBECODING\ITERATIONS y puedes crear tú ya para el sprint 1 "planificacion" que incluya el trabajo hecho tanto en el prompt1.md como en este prompt2.md.

Se prefieren frases cortas y precisas a grandes textos dificilmente mantenibles. Se prima la enumeración de puntos fuertes, ideas fuerza o claves antes que largas parrafadas. 

# Estructura

Usa el zeus\PLANIFICACION\plan_zeus.md para generar un plan de trabajo así como para crear los "prompts" para agentes que conozcan nuestra dinámica de trabajo.

# Iteración 1

Descripción de la tarea: generar los siguientes ficheros

Archivos de resultado:

- zeus\PLANIFICACION\VIBECODING\zeus_main_context_base.md
- zeus\PLANIFICACION\VIBECODING\agents.md

- zeus\PLANIFICACION\VIBECODING\zeus_main_checkpoint_list.md (ava)
- zeus\PLANIFICACION\VIBECODING\iteration_template.md (read only)

Crea el primer archivo de iteration, por ejemplo: "Sprint 1: Prompts 1 & 2".

- zeus\PLANIFICACION\VIBECODING\ITERATION\sprint_01_P1_P2.md

Instrucciones para los agentes que debe incluirse:

- zeus\PLANIFICACION\VIBECODING\zeus_main_context_base.md (los agentes solo pueden escribir con expresa confirmacion del usuario)
- zeus\PLANIFICACION\VIBECODING\agents.md (los agentes podrán editarla si encuentran algo relevante con expreso permiso del usuario)
- zeus\PLANIFICACION\VIBECODING\zeus_main_checkpoint_list.md (los agentes solo pueden establecer el estado de los puntos, pero no agregar info o nuevos puntos sino es con expresa aprobación del usuario)
- zeus\PLANIFICACION\VIBECODING\iteration_template.md (solo lectura, es la base que debe copiarse en ITERATION)
- zeus\PLANIFICACION\VIBECODING\ITERATION