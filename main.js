// Star Cast Cinema - Lógica principal
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");
    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const abierto = mainNav.classList.toggle("nav-open");
            menuToggle.setAttribute("aria-expanded", String(abierto));
            menuToggle.textContent = abierto ? "✕" : "☰";
        });
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const regexTelefono = /^[0-9]{10}$/;
    const regexTarjeta = /^[0-9]{16}$/;

    function mostrarMensaje(contenedor, tipo, texto) {
        if (!contenedor) return;
        contenedor.textContent = texto;
        contenedor.className = `form-feedback ${tipo}`;
        contenedor.hidden = false;
        contenedor.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function marcarCampo(campo, valido) {
        if (!campo) return;
        campo.classList.toggle("input-error", !valido);
        campo.classList.toggle("input-valid", valido);
    }

    function escaparHTML(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    const contactForm = document.getElementById("contact-form");
    const contactFeedback = document.getElementById("contact-feedback");
    if (contactForm) {
        contactForm.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const nombre = document.getElementById("c-nombre");
            const correo = document.getElementById("c-correo");
            const telefono = document.getElementById("c-telefono");
            const asunto = document.getElementById("c-asunto");
            const mensaje = document.getElementById("c-mensaje");
            const validos = [
                nombre.value.trim().length >= 5,
                regexEmail.test(correo.value.trim()),
                regexTelefono.test(telefono.value.trim()),
                asunto.value.trim() !== "",
                mensaje.value.trim().length >= 10
            ];
            [nombre, correo, telefono, asunto, mensaje].forEach((campo, i) => marcarCampo(campo, validos[i]));
            if (!validos[0]) return mostrarMensaje(contactFeedback, "error", "⚠️ Ingresa tu nombre completo (mínimo 5 caracteres)."), nombre.focus();
            if (!validos[1]) return mostrarMensaje(contactFeedback, "error", "⚠️ Ingresa un correo electrónico válido."), correo.focus();
            if (!validos[2]) return mostrarMensaje(contactFeedback, "error", "⚠️ Ingresa un teléfono válido de 10 dígitos."), telefono.focus();
            if (!validos[3]) return mostrarMensaje(contactFeedback, "error", "⚠️ Selecciona un motivo."), asunto.focus();
            if (!validos[4]) return mostrarMensaje(contactFeedback, "error", "⚠️ Escribe al menos 10 caracteres."), mensaje.focus();

            try {
                const respuesta = await fetch("guardar_contacto.php", { method: "POST", body: new FormData(contactForm) });
                const resultado = await respuesta.json();
                if (resultado.ok) {
                    mostrarMensaje(contactFeedback, "success", `✅ ${resultado.mensaje}`);
                    contactForm.reset();
                    [nombre, correo, telefono, asunto, mensaje].forEach((campo) => campo.classList.remove("input-valid", "input-error"));
                } else mostrarMensaje(contactFeedback, "error", `⚠️ ${resultado.mensaje}`);
            } catch (error) {
                mostrarMensaje(contactFeedback, "error", "⚠️ No se pudo conectar con guardar_contacto.php.");
            }
        });
    }

    const tablaTicketsBody = document.getElementById("tabla-tickets-body");
    const tablaMensajesBody = document.getElementById("tabla-mensajes-body");
    if (tablaTicketsBody && tablaMensajesBody) {
        const statTickets = document.getElementById("stat-tickets");
        const statIngresos = document.getElementById("stat-ingresos");
        const statMensajes = document.getElementById("stat-mensajes");
        const filtroForm = document.getElementById("filtro-bd-form");
        const inputBusqueda = document.getElementById("busqueda-bd");
        const btnRecargar = document.getElementById("btn-recargar-bd");
        const dbFeedback = document.getElementById("db-feedback");

        async function cargarDatosBD(termino = "") {
            try {
                const url = termino ? `consultar_datos.php?q=${encodeURIComponent(termino)}` : "consultar_datos.php";
                const respuesta = await fetch(url);
                const datos = await respuesta.json();
                if (!datos.ok) return mostrarMensaje(dbFeedback, "error", "⚠️ No se pudieron leer los registros.");
                dbFeedback.hidden = true;
                statTickets.textContent = datos.resumen.total_tickets;
                statIngresos.textContent = `$${Number(datos.resumen.ingresos).toFixed(2)} MXN`;
                statMensajes.textContent = datos.resumen.total_mensajes;
                tablaTicketsBody.innerHTML = datos.tickets.length === 0
                    ? `<tr><td colspan="7">No se encontraron boletos registrados.</td></tr>`
                    : datos.tickets.map((t) => `<tr><td><span class="badge-folio">${escaparHTML(t.folio)}</span></td><td><strong>${escaparHTML(t.nombre_cliente)}</strong></td><td>${escaparHTML(t.correo)}<br><small>Tel: ${escaparHTML(t.celular)}</small></td><td>${escaparHTML(t.funcion)}</td><td><span class="badge-seat">${escaparHTML(t.asientos)}</span></td><td><strong>$${Number(t.total).toFixed(2)}</strong></td><td>${escaparHTML(t.fecha)}</td></tr>`).join("");
                tablaMensajesBody.innerHTML = datos.mensajes.length === 0
                    ? `<tr><td colspan="6">Aún no hay mensajes registrados.</td></tr>`
                    : datos.mensajes.map((m) => `<tr><td>${escaparHTML(m.nombre)}</td><td>${escaparHTML(m.correo)}</td><td>${escaparHTML(m.telefono)}</td><td>${escaparHTML(m.asunto)}</td><td>${escaparHTML(m.mensaje)}</td><td>${escaparHTML(m.fecha)}</td></tr>`).join("");
            } catch (error) {
                mostrarMensaje(dbFeedback, "error", "⚠️ No se pudo conectar con consultar_datos.php.");
            }
        }

        if (filtroForm) filtroForm.addEventListener("submit", (evento) => { evento.preventDefault(); cargarDatosBD(inputBusqueda.value.trim()); });
        if (btnRecargar) btnRecargar.addEventListener("click", () => { inputBusqueda.value = ""; cargarDatosBD(); });
        cargarDatosBD();
    }

    const gridGeneral = document.getElementById("grid-general");
    const gridVip = document.getElementById("grid-vip");
    if (gridGeneral && gridVip) {
        const filasGeneral = ["A", "B", "C", "D", "E", "F"];
        const filasVip = ["G", "H", "I", "J"];
        let seleccionados = [];
        let totalActual = 0;
        const seccionMapa = document.getElementById("seccion-mapa");
        const seccionFormulario = document.getElementById("seccion-formulario");
        const inputFuncion = document.getElementById("funcion");
        const inputAsientos = document.getElementById("asientos");
        const inputZona = document.getElementById("zona");
        const resumenAsientos = document.getElementById("resumen-asientos");
        const resumenTotal = document.getElementById("resumen-total");
        const contador = document.getElementById("contador-asientos");
        const btnConfirmar = document.getElementById("btn-confirmar-asientos");

        function actualizarResumen() {
            totalActual = seleccionados.reduce((suma, asiento) => suma + asiento.precio, 0);
            if (seleccionados.length === 0) {
                resumenAsientos.textContent = "Ninguno";
                resumenTotal.textContent = "$0.00 MXN";
                contador.textContent = "0";
                btnConfirmar.disabled = true;
                if (inputAsientos) inputAsientos.value = "";
                if (inputZona) inputZona.value = "";
                return;
            }
            const lista = seleccionados.map((asiento) => asiento.codigo).join(", ");
            const zonas = [...new Set(seleccionados.map((asiento) => asiento.zona))].join(" + ");
            resumenAsientos.textContent = lista;
            resumenTotal.textContent = `$${totalActual.toFixed(2)} MXN`;
            contador.textContent = String(seleccionados.length);
            btnConfirmar.disabled = false;
            if (inputAsientos) inputAsientos.value = lista;
            if (inputZona) inputZona.value = `Zona ${zonas} — Total: $${totalActual.toFixed(2)} MXN`;
        }

        function crearFila(letra, zona, precio) {
            const li = document.createElement("li");
            li.className = "seat-line";
            const spanIzq = document.createElement("span");
            spanIzq.className = zona === "VIP" ? "row-id vip-text" : "row-id";
            spanIzq.textContent = letra;
            li.appendChild(spanIzq);

            for (let numero = 1; numero <= 6; numero++) {
                if (numero === 4) {
                    const pasillo = document.createElement("span");
                    pasillo.className = "aisle";
                    li.appendChild(pasillo);
                }
                const codigo = `${letra}${numero}`;
                const codigoGuardado = zona === "VIP" ? `${codigo} (VIP)` : codigo;
                const butaca = document.createElement("button");
                butaca.type = "button";
                butaca.className = `chair ${zona.toLowerCase()}`;
                butaca.dataset.seat = codigoGuardado;
                butaca.dataset.zone = zona;
                butaca.dataset.price = String(precio);
                butaca.textContent = codigo;
                butaca.addEventListener("click", () => {
                    if (butaca.disabled) return;
                    const indice = seleccionados.findIndex((asiento) => asiento.codigo === codigoGuardado);
                    if (indice === -1) {
                        seleccionados.push({ codigo: codigoGuardado, zona, precio });
                        butaca.classList.add("selected");
                    } else {
                        seleccionados.splice(indice, 1);
                        butaca.classList.remove("selected");
                    }
                    actualizarResumen();
                });
                li.appendChild(butaca);
            }

            const spanDer = document.createElement("span");
            spanDer.className = zona === "VIP" ? "row-id vip-text" : "row-id";
            spanDer.textContent = letra;
            li.appendChild(spanDer);
            return li;
        }

        filasGeneral.forEach((letra) => gridGeneral.appendChild(crearFila(letra, "General", 85)));
        filasVip.forEach((letra) => gridVip.appendChild(crearFila(letra, "VIP", 160)));

        async function cargarOcupados() {
            document.querySelectorAll(".chair").forEach((butaca) => {
                butaca.disabled = false;
                butaca.classList.remove("occupied");
            });
            if (!inputFuncion || !inputFuncion.value) return;
            try {
                const respuesta = await fetch(`obtener_asientos.php?funcion=${encodeURIComponent(inputFuncion.value)}`);
                const datos = await respuesta.json();
                if (!datos.ok) return;
                const ocupados = new Set(datos.ocupados);
                document.querySelectorAll(".chair").forEach((butaca) => {
                    const codigo = butaca.dataset.seat.replace(" (VIP)", "");
                    if (ocupados.has(codigo)) {
                        butaca.disabled = true;
                        butaca.classList.add("occupied");
                        butaca.classList.remove("selected");
                    }
                });
                seleccionados = seleccionados.filter((asiento) => !ocupados.has(asiento.codigo.replace(" (VIP)", "")));
                actualizarResumen();
            } catch (error) { /* Conservar el mapa si falla la disponibilidad */ }
        }

        if (inputFuncion) inputFuncion.addEventListener("change", cargarOcupados);
        const mapaParametros = { fantasma: "El Fantasma del Escenario", odisea: "Odisea Galáctica", noche: "Noche de Estreno", sinfonia: "Sinfonía Nocturna" };
        const funcionParam = new URLSearchParams(window.location.search).get("funcion");
        if (funcionParam && mapaParametros[funcionParam] && inputFuncion) inputFuncion.value = mapaParametros[funcionParam];
        cargarOcupados();

        if (btnConfirmar) btnConfirmar.addEventListener("click", () => {
            if (seleccionados.length === 0) return;
            seccionMapa.hidden = true;
            seccionFormulario.hidden = false;
            seccionFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        const btnModificar = document.getElementById("btn-modificar-asientos");
        if (btnModificar) btnModificar.addEventListener("click", () => {
            seccionFormulario.hidden = true;
            seccionMapa.hidden = false;
            seccionMapa.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        const bookingForm = document.getElementById("booking-form");
        const bookingFeedback = document.getElementById("booking-feedback");
        if (bookingForm) bookingForm.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (seleccionados.length === 0) return mostrarMensaje(bookingFeedback, "error", "⚠️ Selecciona al menos un asiento.");
            const nombre = document.getElementById("nombre");
            const correo = document.getElementById("correo");
            const celular = document.getElementById("celular");
            const tarjeta = document.getElementById("tarjeta");
            const validos = [nombre.value.trim().length >= 5, regexEmail.test(correo.value.trim()), regexTelefono.test(celular.value.trim()), inputFuncion.value !== "", regexTarjeta.test(tarjeta.value.trim())];
            [nombre, correo, celular, inputFuncion, tarjeta].forEach((campo, i) => marcarCampo(campo, validos[i]));
            if (!validos[0]) return mostrarMensaje(bookingFeedback, "error", "⚠️ Ingresa tu nombre completo."), nombre.focus();
            if (!validos[1]) return mostrarMensaje(bookingFeedback, "error", "⚠️ Ingresa un correo válido."), correo.focus();
            if (!validos[2]) return mostrarMensaje(bookingFeedback, "error", "⚠️ Ingresa un celular de 10 dígitos."), celular.focus();
            if (!validos[3]) return mostrarMensaje(bookingFeedback, "error", "⚠️ Selecciona una función."), inputFuncion.focus();
            if (!validos[4]) return mostrarMensaje(bookingFeedback, "error", "⚠️ Ingresa una tarjeta de 16 dígitos."), tarjeta.focus();

            const datos = new FormData(bookingForm);
            datos.set("asientos", inputAsientos.value);
            datos.set("zona", inputZona.value);
            datos.set("total", String(totalActual));

            try {
                const respuesta = await fetch("guardar_ticket.php", { method: "POST", body: datos });
                const resultado = await respuesta.json();
                if (!resultado.ok) return mostrarMensaje(bookingFeedback, "error", `⚠️ ${resultado.mensaje}`);
                document.getElementById("ticket-id").textContent = resultado.folio;
                document.getElementById("t-nombre").textContent = nombre.value;
                document.getElementById("t-correo").textContent = correo.value;
                document.getElementById("t-celular").textContent = celular.value;
                document.getElementById("t-funcion").textContent = inputFuncion.value;
                document.getElementById("t-asientos").textContent = inputAsientos.value;
                document.getElementById("t-zona").textContent = `$${totalActual.toFixed(2)} MXN`;
                document.getElementById("t-fecha").textContent = resultado.fecha;
                const ticket = document.getElementById("ticket-digital");
                ticket.hidden = false;
                mostrarMensaje(bookingFeedback, "success", `✅ ${resultado.mensaje}`);
                ticket.scrollIntoView({ behavior: "smooth", block: "start" });
                document.querySelectorAll(".chair.selected").forEach((butaca) => { butaca.disabled = true; butaca.classList.remove("selected"); butaca.classList.add("occupied"); });
                seleccionados = [];
                actualizarResumen();
            } catch (error) {
                mostrarMensaje(bookingFeedback, "error", "⚠️ No se pudo conectar con guardar_ticket.php.");
            }
        });
    }
});
