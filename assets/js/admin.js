(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapar = (valor = "") => String(valor).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const clonar = valor => JSON.parse(JSON.stringify(valor));
  const uid = () => crypto.randomUUID();
  let cliente = null;
  let datos = clonar(window.PORTAFOLIO_DATOS || {});
  let pasoActual = 0;
  let fechaPublicacion = null;
  let temporizadorMensaje = null;
  const archivosPendientes = new Map();

  const pasos = [
    ["identidad", "Identidad y contacto", "fa-user"],
    ["perfil", "Perfil profesional", "fa-address-card"],
    ["tecnologias", "Tecnologías", "fa-code"],
    ["experiencia", "Experiencia", "fa-briefcase"],
    ["proyectos", "Proyectos y evidencias", "fa-diagram-project"],
    ["formacion", "Estudios y cursos", "fa-graduation-cap"],
    ["habilidades", "Habilidades e idiomas", "fa-language"],
    ["revision", "Revisar y generar", "fa-wand-magic-sparkles"],
  ];

  const iconosDisponibles = [
    ["fa-solid fa-star", "Destacado"],
    ["fa-solid fa-graduation-cap", "Educación"],
    ["fa-solid fa-code", "Código y desarrollo"],
    ["fa-solid fa-laptop-code", "Software"],
    ["fa-solid fa-mobile-screen", "Aplicaciones móviles"],
    ["fa-solid fa-layer-group", "Proyectos"],
    ["fa-solid fa-briefcase", "Experiencia laboral"],
    ["fa-solid fa-building", "Empresa"],
    ["fa-solid fa-certificate", "Certificados"],
    ["fa-solid fa-database", "Bases de datos"],
    ["fa-solid fa-cloud", "Nube"],
    ["fa-solid fa-globe", "Web"],
    ["fa-solid fa-chart-line", "Resultados y crecimiento"],
    ["fa-solid fa-rocket", "Innovación"],
    ["fa-solid fa-users", "Trabajo en equipo"],
    ["fa-solid fa-award", "Logros"],
    ["fa-solid fa-language", "Idiomas"],
    ["fa-solid fa-screwdriver-wrench", "Herramientas"],
  ];

  const repetidores = {
    tecnologias: { propiedad: "tecnologias", titulo: "Grupo de tecnologías", campos: [["categoria","Categoría","text"],["icono","Icono","icono"],["items","Tecnologías (una por línea)","lista"]] },
    experiencia: { propiedad: "experiencia", titulo: "Experiencia laboral", campos: [["empresa","Empresa","text"],["cargo","Cargo","text"],["periodo","Periodo","text"],["ubicacion","Ubicación","text"],["funciones","Funciones (una por línea)","lista"],["archivoLaboral","Certificado laboral","pdf"]] },
    proyectos: { propiedad: "proyectos", titulo: "Proyecto", campos: [["destacado","Proyecto destacado","check"],["nombre","Nombre","text"],["subtitulo","Subtítulo","text"],["descripcion","Descripción","textarea"],["tecnologias","Tecnologías (una por línea)","lista"],["caracteristicas","Características (una por línea)","lista"],["github","Enlace de GitHub","url"],["demo","Enlace de demostración","url"],["video","Enlace de video (YouTube, Vimeo, etc.)","url"],["imagen","Imagen de portada","imagen"],["evidencias","Fotos de evidencia","imagenes"],["videoArchivo","Archivo de video","video"]] },
    educacion: { propiedad: "educacion", titulo: "Estudio", campos: [["programa","Programa o título","text"],["institucion","Institución","text"],["periodo","Periodo","text"],["detalle","Detalle","text"],["archivo","Diploma o certificado","pdf"]] },
    certificaciones: { propiedad: "certificaciones", titulo: "Curso o certificación", campos: [["nombre","Nombre","text"],["entidad","Entidad","text"],["archivo","Certificado","pdf"]] },
    idiomas: { propiedad: "idiomas", titulo: "Idioma", campos: [["nombre","Idioma","text"],["descripcion","Nivel","text"],["nivel","Porcentaje","number"]] },
    indicadores: { propiedad: "indicadores", titulo: "Indicador destacado", campos: [["valor","Valor","text"],["etiqueta","Etiqueta","text"],["icono","Icono","icono"]] },
  };

  function asegurarEstructura() {
    datos.configuracion ||= {};
    datos.persona ||= {};
    datos.sobreMi ||= { titulo: "", parrafos: [], roles: [] };
    ["tecnologias","experiencia","proyectos","educacion","certificaciones","habilidades","idiomas","indicadores"].forEach(prop => { if (!Array.isArray(datos[prop])) datos[prop] = []; });
    Object.values(repetidores).forEach(def => datos[def.propiedad].forEach(item => { item._uid ||= uid(); item.evidencias ||= item.evidencias || []; }));
  }

  function mensaje(texto, tipo = "exito") {
    const elemento = $("#admin-mensaje");
    clearTimeout(temporizadorMensaje);
    elemento.textContent = texto;
    elemento.className = `admin-mensaje ${tipo}`;
    temporizadorMensaje = setTimeout(() => elemento.classList.add("d-none"), 6000);
  }

  function traducirError(error) {
    const original = error?.message || "Error desconocido";
    const normal = original.toLowerCase();
    if (normal.includes("email not confirmed")) return "Debes confirmar el correo en Supabase.";
    if (normal.includes("invalid login credentials")) return "Correo o contraseña no reconocidos por Supabase.";
    if (normal.includes("portfolio_site") || normal.includes("schema cache")) return "Falta ejecutar supabase/upgrade-constructor.sql en Supabase.";
    if (normal.includes("row-level security") || normal.includes("no autorizado")) return "Este usuario no tiene permisos de administrador.";
    return original;
  }

  function cargando(boton, activo, texto = "Procesando...") {
    if (!boton) return;
    if (activo) { boton.dataset.original = boton.innerHTML; boton.disabled = true; boton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${texto}`; }
    else { boton.disabled = false; boton.innerHTML = boton.dataset.original || boton.innerHTML; }
  }

  function campo(ruta, etiqueta, valor = "", tipo = "text", ancho = "col-md-6", ayuda = "") {
    const lista = tipo === "lista";
    const textarea = tipo === "textarea" || lista;
    const contenido = Array.isArray(valor) ? valor.join("\n") : valor ?? "";
    const control = textarea
      ? `<textarea class="form-control" data-ruta="${ruta}" ${lista ? 'data-lista="true"' : ""} rows="${lista ? 4 : 5}">${escapar(contenido)}</textarea>`
      : `<input class="form-control" data-ruta="${ruta}" type="${tipo}" value="${escapar(contenido)}" />`;
    return `<div class="${ancho}"><label class="form-label">${escapar(etiqueta)}</label>${control}${ayuda ? `<small class="form-ayuda">${escapar(ayuda)}</small>` : ""}</div>`;
  }

  function obtenerRuta(ruta) {
    return ruta.split(".").reduce((obj, clave) => obj?.[clave], datos);
  }

  function asignarRuta(ruta, valor) {
    const partes = ruta.split(".");
    let destino = datos;
    partes.slice(0,-1).forEach(clave => { destino[clave] ||= {}; destino = destino[clave]; });
    destino[partes.at(-1)] = valor;
  }

  function renderIdentidad() {
    const p = datos.persona, c = datos.configuracion;
    return encabezadoPaso("Identidad y contacto", "La información principal que verán reclutadores y visitantes.") + `<div class="row g-3">
      ${campo("persona.nombre","Nombre completo",p.nombre)}${campo("persona.nombreCorto","Nombre corto",p.nombreCorto)}
      ${campo("persona.iniciales","Iniciales",p.iniciales)}${campo("persona.cargoPrincipal","Cargo principal",p.cargoPrincipal)}
      ${campo("persona.cargosAlternativos","Cargos alternativos (uno por línea)",p.cargosAlternativos,"lista","col-12")}
      ${campo("persona.especialidad","Especialidad",p.especialidad,"text","col-12")}${campo("persona.frasePrincipal","Frase principal",p.frasePrincipal,"textarea","col-12")}
      ${campo("persona.estadoLaboral","Estado laboral",p.estadoLaboral)}${campo("persona.modalidad","Modalidad",p.modalidad)}
      ${campo("persona.ciudad","Ciudad",p.ciudad)}${campo("persona.departamento","Departamento",p.departamento)}${campo("persona.pais","País",p.pais)}
      ${campo("persona.telefonoVisible","Teléfono visible",p.telefonoVisible)}${campo("persona.telefonoEnlace","Teléfono para enlace",p.telefonoEnlace)}
      ${campo("persona.correo","Correo",p.correo,"email")}${campo("persona.github","GitHub",p.github,"url")}${campo("persona.linkedin","LinkedIn",p.linkedin,"url")}
      ${campo("configuracion.tituloSeo","Título para Google",c.tituloSeo,"text","col-12")}${campo("configuracion.descripcionSeo","Descripción para Google",c.descripcionSeo,"textarea","col-12")}
      ${archivoSimple("fotoPerfil","Fotografía de perfil",p.foto,"image/*")}
    </div>`;
  }

  function renderPerfil() {
    const s = datos.sobreMi;
    return encabezadoPaso("Perfil profesional", "Presenta tu historia, objetivos y roles de interés.") + `<div class="row g-3">
      ${campo("sobreMi.titulo","Título de la sección",s.titulo,"text","col-12")}
      ${campo("sobreMi.parrafos","Párrafos (uno por línea)",s.parrafos,"lista","col-12")}
      ${campo("sobreMi.roles","Roles de interés (uno por línea)",s.roles,"lista","col-12")}
    </div><hr class="constructor-separador"><div id="repetidor-indicadores">${renderRepetidor("indicadores")}</div>`;
  }

  function encabezadoPaso(titulo, descripcion) {
    return `<div class="constructor-titulo"><span class="subtitulo-tarjeta">Paso ${pasoActual + 1} de ${pasos.length}</span><h2>${escapar(titulo)}</h2><p>${escapar(descripcion)}</p></div>`;
  }

  function archivoSimple(clave, etiqueta, actual, accept, multiple = false) {
    const pendiente = archivosPendientes.get(clave);
    return `<div class="col-12 constructor-archivo"><label class="form-label">${escapar(etiqueta)}</label><input class="form-control" data-archivo-simple="${clave}" type="file" accept="${accept}" ${multiple ? "multiple" : ""} />${actual ? `<small class="form-ayuda">Archivo actual: <a href="${escapar(actual)}" target="_blank" rel="noopener">ver</a></small>` : ""}${pendiente ? `<small class="archivo-pendiente">${multiple ? pendiente.length : 1} archivo(s) pendiente(s)</small>` : ""}</div>`;
  }

  function inputRepetidor(campoDef, item, tipo, itemUid) {
    const [nombre, etiqueta, control] = campoDef;
    const valor = item[nombre];
    const key = `${tipo}:${itemUid}:${nombre}`;
    if (["pdf","imagen","imagenes","video"].includes(control)) {
      const accept = control === "pdf" ? "application/pdf,.pdf" : control === "video" ? "video/*" : "image/*";
      const multiple = control === "imagenes";
      const actual = multiple ? (Array.isArray(valor) ? valor : []) : valor;
      const enlaces = multiple ? actual.map((url,i) => `<span class="media-chip"><a href="${escapar(url)}" target="_blank">Evidencia ${i+1}</a><button type="button" data-quitar-media="${i}" data-campo="${nombre}" aria-label="Quitar">×</button></span>`).join("") : actual ? `<a href="${escapar(actual)}" target="_blank" rel="noopener">Ver archivo actual</a>` : "";
      return `<div class="col-12"><label class="form-label">${escapar(etiqueta)}</label><input class="form-control" data-campo="${nombre}" data-control="${control}" type="file" accept="${accept}" ${multiple ? "multiple" : ""} /><div class="media-actual">${enlaces}</div>${archivosPendientes.has(key) ? '<small class="archivo-pendiente">Nuevo archivo seleccionado</small>' : ""}</div>`;
    }
    if (control === "check") return `<div class="col-12"><div class="form-check form-switch"><input class="form-check-input" data-campo="${nombre}" data-control="check" type="checkbox" ${valor ? "checked" : ""} /><label class="form-check-label">${escapar(etiqueta)}</label></div></div>`;
    if (control === "icono") {
      const seleccionado = valor || iconosDisponibles[0][0];
      return `<div class="col-md-6"><label class="form-label">${escapar(etiqueta)}</label><div class="selector-icono"><span><i class="${escapar(seleccionado)}"></i></span><select class="form-select" data-campo="${nombre}" data-control="icono">${iconosDisponibles.map(([clase,texto]) => `<option value="${escapar(clase)}" ${clase === seleccionado ? "selected" : ""}>${escapar(texto)}</option>`).join("")}</select></div><small class="form-ayuda">Elige el símbolo que mejor represente este elemento.</small></div>`;
    }
    const contenido = Array.isArray(valor) ? valor.join("\n") : valor ?? "";
    const ancho = ["textarea","lista"].includes(control) ? "col-12" : "col-md-6";
    const input = ["textarea","lista"].includes(control) ? `<textarea class="form-control" data-campo="${nombre}" data-control="${control}" rows="4">${escapar(contenido)}</textarea>` : `<input class="form-control" data-campo="${nombre}" data-control="${control}" type="${control}" value="${escapar(contenido)}" />`;
    return `<div class="${ancho}"><label class="form-label">${escapar(etiqueta)}</label>${input}</div>`;
  }

  function renderRepetidor(tipo) {
    const def = repetidores[tipo];
    const items = datos[def.propiedad] || [];
    return `<div class="repetidor-cabecera"><div><h3>${escapar(def.titulo)}</h3><p>Agrega, edita, elimina y ordena los elementos.</p></div><button class="btn btn-primary btn-sm" type="button" data-agregar="${tipo}"><i class="fa-solid fa-plus"></i> Agregar</button></div><div class="repetidor-lista" data-repetidor="${tipo}">${items.length ? items.map((item,indice) => `<article class="constructor-item" data-uid="${item._uid}"><div class="constructor-item-cabecera"><strong>${escapar(item.nombre || item.programa || item.empresa || item.categoria || item.valor || `${def.titulo} ${indice+1}`)}</strong><div><button class="boton-mini" type="button" data-mover="arriba" title="Subir"><i class="fa-solid fa-arrow-up"></i></button><button class="boton-mini" type="button" data-mover="abajo" title="Bajar"><i class="fa-solid fa-arrow-down"></i></button><button class="boton-mini peligro" type="button" data-quitar title="Eliminar"><i class="fa-solid fa-trash"></i></button></div></div><div class="row g-3">${def.campos.map(c => inputRepetidor(c,item,tipo,item._uid)).join("")}</div></article>`).join("") : '<div class="admin-vacio">No hay elementos. Pulsa “Agregar”.</div>'}</div>`;
  }

  function renderPaso() {
    asegurarEstructura();
    const id = pasos[pasoActual][0];
    let html = "";
    if (id === "identidad") html = renderIdentidad();
    if (id === "perfil") html = renderPerfil();
    if (id === "tecnologias") html = encabezadoPaso("Tecnologías", "Organiza tus lenguajes, herramientas, frameworks y conocimientos.") + renderRepetidor("tecnologias");
    if (id === "experiencia") html = encabezadoPaso("Experiencia", "Registra trabajos, prácticas y sus certificados laborales.") + renderRepetidor("experiencia");
    if (id === "proyectos") html = encabezadoPaso("Proyectos y evidencias", "Incluye portada, capturas, enlaces y videos de cada proyecto.") + renderRepetidor("proyectos");
    if (id === "formacion") html = encabezadoPaso("Estudios y cursos", "Añade educación formal, diplomas, cursos y certificaciones.") + `<div class="mb-5">${renderRepetidor("educacion")}</div>${renderRepetidor("certificaciones")}`;
    if (id === "habilidades") html = encabezadoPaso("Habilidades e idiomas", "Completa tus habilidades profesionales y nivel de idiomas.") + `<div class="row g-3 mb-5">${campo("habilidades","Habilidades (una por línea)",datos.habilidades,"lista","col-12")}</div>${renderRepetidor("idiomas")}`;
    if (id === "revision") html = renderRevision();
    $("#constructor-contenido").innerHTML = html;
    actualizarNavegacion();
  }

  function renderRevision() {
    const resumen = [["Experiencias",datos.experiencia.length],["Proyectos",datos.proyectos.length],["Estudios",datos.educacion.length],["Cursos",datos.certificaciones.length],["Tecnologías",datos.tecnologias.length],["Idiomas",datos.idiomas.length]];
    return encabezadoPaso("Revisar y generar", "Guarda una copia completa y publica todos los cambios de una sola vez.") + `<div class="revision-identidad"><img src="${escapar(datos.persona.foto || 'assets/img/perfil/luis-barbosa-recorte.png')}" alt="Vista previa"><div><h3>${escapar(datos.persona.nombre || "Tu nombre")}</h3><p>${escapar(datos.persona.cargoPrincipal || "Tu cargo")}</p></div></div><div class="revision-resumen">${resumen.map(([label,total]) => `<article><strong>${total}</strong><span>${label}</span></article>`).join("")}</div><div class="alert alert-info mt-4"><i class="fa-solid fa-circle-info"></i> “Generar y publicar todo” reemplazará la versión pública por este borrador. Podrás seguir editándolo después.</div>`;
  }

  function capturarPaso() {
    document.querySelectorAll("[data-ruta]").forEach(control => asignarRuta(control.dataset.ruta, control.dataset.lista ? control.value.split("\n").map(v => v.trim()).filter(Boolean) : control.value.trim()));
    document.querySelectorAll("[data-archivo-simple]").forEach(control => { if (control.files.length) archivosPendientes.set(control.dataset.archivoSimple, control.multiple ? [...control.files] : control.files[0]); });
    document.querySelectorAll("[data-repetidor]").forEach(lista => {
      const tipo = lista.dataset.repetidor, def = repetidores[tipo];
      datos[def.propiedad] = [...lista.querySelectorAll(".constructor-item")].map(tarjeta => {
        const anterior = datos[def.propiedad].find(item => item._uid === tarjeta.dataset.uid) || { _uid: tarjeta.dataset.uid };
        const item = { ...anterior };
        tarjeta.querySelectorAll("[data-campo]").forEach(control => {
          const nombre = control.dataset.campo, tipoControl = control.dataset.control;
          if (["pdf","imagen","imagenes","video"].includes(tipoControl)) {
            if (control.files.length) archivosPendientes.set(`${tipo}:${item._uid}:${nombre}`, tipoControl === "imagenes" ? [...control.files] : control.files[0]);
          } else if (tipoControl === "check") item[nombre] = control.checked;
          else if (tipoControl === "lista") item[nombre] = control.value.split("\n").map(v => v.trim()).filter(Boolean);
          else if (tipoControl === "number") item[nombre] = Number(control.value) || 0;
          else item[nombre] = control.value.trim();
        });
        return item;
      });
    });
  }

  function actualizarNavegacion() {
    $("#constructor-pasos").innerHTML = pasos.map(([id,nombre,icono],indice) => `<button type="button" class="${indice === pasoActual ? "activo" : ""} ${indice < pasoActual ? "completo" : ""}" data-paso="${indice}"><span><i class="fa-solid ${indice < pasoActual ? "fa-check" : icono}"></i></span>${escapar(nombre)}</button>`).join("");
    $("#boton-anterior").disabled = pasoActual === 0;
    $("#boton-siguiente").classList.toggle("d-none", pasoActual === pasos.length - 1);
    $("#boton-publicar").classList.toggle("d-none", pasoActual !== pasos.length - 1);
  }

  function cambiarPaso(nuevo) {
    capturarPaso();
    pasoActual = Math.max(0, Math.min(pasos.length - 1, Number(nuevo)));
    renderPaso();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function archivoRutaSegura(nombre) {
    return `${Date.now()}-${uid()}-${nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.]+/g,"-")}`;
  }

  async function subir(archivo, carpeta) {
    const maximo = 50 * 1024 * 1024;
    if (archivo.size > maximo) throw new Error(`${archivo.name} supera el límite de 50 MB.`);
    const bucket = window.SUPABASE_CONFIG.bucket || "portafolio";
    const ruta = `${carpeta}/${archivoRutaSegura(archivo.name)}`;
    const { error } = await cliente.storage.from(bucket).upload(ruta, archivo, { upsert: false, contentType: archivo.type || undefined });
    if (error) throw error;
    return cliente.storage.from(bucket).getPublicUrl(ruta).data.publicUrl;
  }

  async function procesarArchivos() {
    for (const [clave, valor] of [...archivosPendientes.entries()]) {
      if (clave === "fotoPerfil") { datos.persona.foto = await subir(valor,"perfil"); archivosPendientes.delete(clave); continue; }
      const [tipo,itemUid,campo] = clave.split(":");
      const def = repetidores[tipo], item = datos[def?.propiedad]?.find(registro => registro._uid === itemUid);
      if (!item) { archivosPendientes.delete(clave); continue; }
      if (Array.isArray(valor)) {
        const urls = [];
        for (const archivo of valor) urls.push(await subir(archivo, tipo));
        item[campo] = [...(Array.isArray(item[campo]) ? item[campo] : []), ...urls];
      } else item[campo] = await subir(valor, tipo);
      archivosPendientes.delete(clave);
    }
  }

  function datosPublicables() {
    const copia = clonar(datos);
    const limpiar = valor => {
      if (Array.isArray(valor)) return valor.map(limpiar);
      if (valor && typeof valor === "object") { delete valor._uid; Object.values(valor).forEach(limpiar); }
      return valor;
    };
    return limpiar(copia);
  }

  async function guardarBorrador(evento) {
    capturarPaso();
    const boton = evento?.currentTarget || $("#boton-guardar");
    cargando(boton,true,"Guardando...");
    try {
      await procesarArchivos();
      const { error } = await cliente.from("portfolio_site").update({ borrador: datosPublicables(), updated_at: new Date().toISOString() }).eq("id",1);
      if (error) throw error;
      mensaje("Borrador guardado. Todavía no se ha publicado.");
      renderPaso();
    } catch (error) { console.error(error); mensaje(traducirError(error),"error"); }
    finally { cargando(boton,false); }
  }

  async function publicar(evento) {
    evento.preventDefault();
    capturarPaso();
    const boton = $("#boton-publicar");
    cargando(boton,true,"Generando...");
    try {
      await procesarArchivos();
      const { data: fecha, error } = await cliente.rpc("publicar_portafolio", { nuevos_datos: datosPublicables() });
      if (error) throw error;
      fechaPublicacion = fecha;
      actualizarFecha();
      mensaje("Portafolio generado y publicado correctamente.");
      renderPaso();
    } catch (error) { console.error(error); mensaje(traducirError(error),"error"); }
    finally { cargando(boton,false); }
  }

  function actualizarFecha() {
    $("#estado-borrador").innerHTML = fechaPublicacion ? '<i class="fa-solid fa-circle-check"></i> Publicado' : '<i class="fa-solid fa-circle"></i> Borrador';
    $("#fecha-publicacion").textContent = fechaPublicacion ? `Última publicación: ${new Date(fechaPublicacion).toLocaleString("es-CO")}` : "Todavía no publicado";
  }

  async function cargarConstructor() {
    const { data: fila, error } = await cliente.from("portfolio_site").select("borrador,publicado,published_at").eq("id",1).single();
    if (error) throw error;
    const guardado = fila.borrador && Object.keys(fila.borrador).length ? fila.borrador : fila.publicado;
    if (guardado && Object.keys(guardado).length) datos = guardado;
    fechaPublicacion = fila.published_at;
    asegurarEstructura(); actualizarFecha(); renderPaso();
  }

  async function iniciarSesion(evento) {
    evento.preventDefault(); const boton = evento.submitter; cargando(boton,true,"Ingresando...");
    try {
      const { data: sesion, error } = await cliente.auth.signInWithPassword({ email: $("#correo-admin").value.trim(), password: $("#clave-admin").value });
      if (error) throw error;
      const { data: esAdmin } = await cliente.rpc("is_portfolio_admin");
      if (!esAdmin) { await cliente.auth.signOut(); throw new Error("No autorizado"); }
      mostrarPanel(sesion.session); await cargarConstructor();
    } catch (error) { mensaje(traducirError(error),"error"); }
    finally { cargando(boton,false); }
  }

  function mostrarPanel(sesion) {
    $("#seccion-acceso").classList.toggle("d-none",Boolean(sesion));
    $("#seccion-panel").classList.toggle("d-none",!sesion);
    $("#boton-salir").classList.toggle("d-none",!sesion);
  }

  function importarActuales() {
    if (!confirm("¿Reemplazar el borrador con todos los datos actuales del portafolio?")) return;
    datos = clonar(window.PORTAFOLIO_DATOS); asegurarEstructura(); pasoActual = 0; renderPaso(); mensaje("Datos actuales cargados en el constructor. Pulsa Guardar borrador o Generar y publicar.");
  }

  function eventosConstructor(evento) {
    const agregar = evento.target.closest("[data-agregar]");
    const quitar = evento.target.closest("[data-quitar]");
    const mover = evento.target.closest("[data-mover]");
    const quitarMedia = evento.target.closest("[data-quitar-media]");
    if (agregar) { capturarPaso(); const def = repetidores[agregar.dataset.agregar]; datos[def.propiedad].push({ _uid: uid() }); renderPaso(); }
    if (quitar) { capturarPaso(); const tarjeta = quitar.closest(".constructor-item"), lista = quitar.closest("[data-repetidor]"), def = repetidores[lista.dataset.repetidor]; datos[def.propiedad] = datos[def.propiedad].filter(item => item._uid !== tarjeta.dataset.uid); renderPaso(); }
    if (mover) { capturarPaso(); const tarjeta = mover.closest(".constructor-item"), lista = mover.closest("[data-repetidor]"), def = repetidores[lista.dataset.repetidor], arreglo = datos[def.propiedad], indice = arreglo.findIndex(i => i._uid === tarjeta.dataset.uid), destino = mover.dataset.mover === "arriba" ? indice-1 : indice+1; if (destino >= 0 && destino < arreglo.length) [arreglo[indice],arreglo[destino]]=[arreglo[destino],arreglo[indice]]; renderPaso(); }
    if (quitarMedia) { capturarPaso(); const tarjeta = quitarMedia.closest(".constructor-item"), lista = quitarMedia.closest("[data-repetidor]"), def = repetidores[lista.dataset.repetidor], item = datos[def.propiedad].find(i => i._uid === tarjeta.dataset.uid); item[quitarMedia.dataset.campo].splice(Number(quitarMedia.dataset.quitarMedia),1); renderPaso(); }
  }

  async function iniciar() {
    if (!window.PortafolioSupabase?.estaConfigurado()) { $("#aviso-configuracion").classList.remove("d-none"); $("#formulario-acceso").querySelectorAll("input,button").forEach(c => c.disabled=true); return; }
    cliente = window.PortafolioSupabase.obtenerCliente();
    $("#formulario-acceso").addEventListener("submit",iniciarSesion);
    $("#formulario-constructor").addEventListener("submit",publicar);
    $("#boton-guardar").addEventListener("click",guardarBorrador);
    $("#boton-siguiente").addEventListener("click",()=>cambiarPaso(pasoActual+1));
    $("#boton-anterior").addEventListener("click",()=>cambiarPaso(pasoActual-1));
    $("#boton-importar").addEventListener("click",importarActuales);
    $("#constructor-pasos").addEventListener("click",e=>{ const b=e.target.closest("[data-paso]"); if(b)cambiarPaso(b.dataset.paso); });
    $("#constructor-contenido").addEventListener("click",eventosConstructor);
    $("#constructor-contenido").addEventListener("change", evento => { if (evento.target.dataset.control === "icono") evento.target.closest(".selector-icono")?.querySelector("i")?.setAttribute("class", evento.target.value); });
    $("#boton-salir").addEventListener("click",async()=>{await cliente.auth.signOut();mostrarPanel(null);});
    const { data: sesion } = await cliente.auth.getSession();
    if (sesion.session) {
      try { const { data: esAdmin } = await cliente.rpc("is_portfolio_admin"); if (!esAdmin) throw new Error("No autorizado"); mostrarPanel(sesion.session); await cargarConstructor(); }
      catch (error) { if (traducirError(error).includes("upgrade-constructor")) $("#aviso-actualizacion").classList.remove("d-none"); else mensaje(traducirError(error),"error"); }
    } else mostrarPanel(null);
  }

  document.addEventListener("DOMContentLoaded",iniciar);
})();