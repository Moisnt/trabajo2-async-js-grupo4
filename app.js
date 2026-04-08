/** * NÚCLEO FUNCIONAL (Simulación de API)
 * Funciones que retornan promesas sin mutar estado externo.
 */

// Utilidad pura para manejar retrasos
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const validarPasaporte = (id) => 
    delay(1500).then(() => 
        id % 2 === 0 
            ? Promise.reject("Error: El ID de pasaporte es inválido (número par)")
            : "Pasaporte verificado"
    );

const verificarRestriccionesVisa = (id) => 
    delay(2000).then(() => 
        Math.random() < 0.3 
            ? Promise.reject("Error: Visa no válida para el destino")
            : "Visa verificada"
    );

const asignarAsiento = () => 
    delay(1000).then(() => {
        const filas = ['A', 'B', 'C', 'D', 'E', 'F'];
        const numero = Math.floor(Math.random() * 30) + 1;
        const letra = filas[Math.floor(Math.random() * filas.length)];
        return `${numero}${letra}`;
    });

const generarPaseAbordar = (datos) => 
    delay(500).then(() => ({
        nombre: `Pasajero #${datos.id}`,
        asiento: datos.asiento,
        estado: "Aprobado"
    }));

/**
 * ORQUESTACIÓN ASINCRÓNICA
 */

// Ejecuta ambas validaciones al mismo tiempo. Falla rápido si alguna falla.
const ejecutarValidaciones = (id) => Promise.all([validarPasaporte(id), verificarRestriccionesVisa(id)]);

// Función principal de lógica. Recibe un 'logger' inyectado para mantener la impureza (I/O) controlada.
const iniciarCheckInLogica = (id, logger) => {
    logger("Iniciando validaciones...");
    
    return ejecutarValidaciones(id)
        .then(([resPasaporte, resVisa]) => {
            logger(resPasaporte);
            logger(resVisa);
            logger("Validaciones exitosas. Asignando asiento...");
            return asignarAsiento();
        })
        .then(asiento => {
            logger(`Asiento asignado: ${asiento}`);
            logger("Generando pase de abordar...");
            return generarPaseAbordar({ id, asiento });
        });
};

// BONUS: Implementación de Timeout Global usando Composición
const conTimeout = (promesa, limiteMs) => {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject("Error: Tiempo de espera agotado"), limiteMs)
    );
    return Promise.race([promesa, timeout]);
};


/**
 * CAPA IMPERATIVA (Efectos secundarios y manipulación del DOM)
 */

// Funciones ayudantes para aislar la mutación del DOM
const getValorInput = (idSelector) => document.getElementById(idSelector).value;
const setBotonDeshabilitado = (idSelector, estado) => document.getElementById(idSelector).disabled = estado;
const limpiarDOM = (idSelector) => document.getElementById(idSelector).innerHTML = '';
const renderizarTexto = (idSelector, html) => {
    const el = document.getElementById(idSelector);
    el.innerHTML = `${el.innerHTML}<div>${html}</div>`;
};

// Handler del evento click
const orquestarUI = () => {
    const idInput = getValorInput('pasajeroId');
    const id = parseInt(idInput, 10);

    if (isNaN(id)) {
        renderizarTexto('consola', '<span class="error">Error: Ingrese un ID válido</span>');
        return;
    }

    // Estado inicial de la UI (bloquear condiciones de carrera)
    setBotonDeshabilitado('btnCheckIn', true);
    limpiarDOM('consola');
    limpiarDOM('resultado');

    // Función de orden superior (inyecta el log en el DOM)
    const logConsola = (mensaje) => {
        const esError = mensaje.toString().startsWith("Error");
        const clase = esError ? 'class="error"' : '';
        renderizarTexto('consola', `<span ${clase}>&gt; ${mensaje}</span>`);
    };

    // Ejecución con un límite de 4 segundos (4000ms)
    conTimeout(iniciarCheckInLogica(id, logConsola), 4000)
        .then(pase => {
            logConsola("Proceso finalizado con éxito.");
            document.getElementById('resultado').innerHTML = `
                <div class="tarjeta">
                    <h2>🎟️ Pase de Abordar</h2>
                    <p><strong>Pasajero:</strong> ${pase.nombre}</p>
                    <p><strong>Asiento:</strong> ${pase.asiento}</p>
                    <p><strong>Estado:</strong> ${pase.estado}</p>
                </div>
            `;
        })
        .catch(error => {
            logConsola(error);
        })
        .finally(() => {
            // Liberar la UI independientemente del resultado
            setBotonDeshabilitado('btnCheckIn', false);
        });
};

// Bind del evento al botón
document.getElementById('btnCheckIn').addEventListener('click', orquestarUI);