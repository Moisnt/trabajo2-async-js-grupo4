# trabajo2-async-js-grupo4
Trabajo 2: JavaScript Asincrónico - Sistema de Check-in para AsyncAir. Grupo 4.

## Puntos claves para la presentación

1. Concurrencia vs Secuencialidad (Promise.all):

    - Si encadenáramos validarPasaporte y luego verificarVisa, el tiempo mínimo sería de 3.5 segundos. Al usar Promise.all([P1, P2]), disparamos ambas en paralelo. El tiempo total de esta fase será igual a la promesa más lenta (2 segundos de la Visa). Cumplimos la restricción de concurrencia y optimizamos el tiempo.

2. El Bonus (Promise.race):

    - Para el Timeout Global se utiliza Promise.race([promesaPrincipal, promesaTimeout]). La primera promesa en resolverse o rechazarse "gana" la carrera. Si el check-in tarda más de 4 segundos, la promesa de timeout hace un reject e interrumpe toda la cadena automáticamente, cayendo en el .catch() final.

3. Cumplimiento del Paradigma Funcional:

    - Ausencia de mutación de variables: No utilizamos variables let. Todos los datos fluyen a través del .then(). Las cadenas de promesas actúan como tuberías (pipelines) de datos.

    - Inmutabilidad: En lugar de crear un objeto de pasajero vacío e ir agregándole propiedades (mutación), generarPaseAbordar toma los datos recolectados y retorna un objeto nuevo.

    - Funciones Puras: Técnicamente, interactuar con el DOM o usar Math.random son operaciones impuras (efectos secundarios). La solución maneja esto mediante inyección de dependencias. La función iniciarCheckInLogica no interactúa directamente con la consola web; recibe una función logger genérica, manteniendo la lógica core separada de la UI.

4. Manejo de Errores (Fail-fast):

    - Cualquier Promise.reject() dentro de la cadena (sea un ID par, la falla del 30% de la visa, o el timeout de 4 segundos) salta inmediatamente todos los .then() posteriores y es capturado por un único bloque .catch() al final de la ejecución, garantizando que no queden procesos huérfanos.