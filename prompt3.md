Analiza la #codebase entiende "el método" y crea un archivo agents_policy.md para activar a un agente cuya misión será validar al final de cada iteración que el/los agentes que han trabajado cumplieron las instrucciones y que antes de cerrar la iteración y commitear los cambios toda la documentación su contenido cumple. Es vital que el agente sepa usar git porque deberá comparar los cambios o los commits y entender pull requests.

El prompt debe explicarle al agente que su acción es un paso de una pipeline DevOps y que devuelve (a parte de documentación) un true o false: permitiendo o no acabar el sprint y mergear; o rechazando para correciones. y que será activado para que:

a) revise el estado de la documentación global.
b) revise la documentación propia de la iteración 
c) emitir un juicio

Otra responsabilidad será, para cada evaluación, crear dos listas, una de vicios y otra de virtudes que se detectan para futuros agentes sepan qué enfatizar y qué evitar y mantener las listas.

La útlima responsabilidad será entender qué ha pasado durante la iteración y detectar posibles oportunidades o necesidades de refactorización del método para que en próximos sprints la situación problemática se recoja mejor. En ese sentido, su evaluación deberá acompañarse con un informe que refleje las motivaciones detectadas y las mejoras.