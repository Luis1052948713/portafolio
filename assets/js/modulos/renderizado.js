/**
 * RENDERIZADO DEL PORTAFOLIO
 * Lee PORTAFOLIO_DATOS y construye las secciones automáticamente.
 * Normalmente no necesitas modificar este archivo.
 */
(() => {
  "use strict";

  const seleccionar = (selector) => document.querySelector(selector);
  const escapar = (valor = "") => String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function ponerTexto(selector, texto) {
    const elemento = seleccionar(selector);
    if (elemento) elemento.textContent = texto ?? "";
  }

  function ponerEnlace(selector, href) {
    const elemento = seleccionar(selector);
    if (elemento) elemento.href = href || "#";
  }

  function actualizarSeo(datos) {
    document.title = datos.configuracion.tituloSeo;
    seleccionar("#meta-descripcion")?.setAttribute("content", datos.configuracion.descripcionSeo);
    seleccionar("#meta-autor")?.setAttribute("content", datos.persona.nombre);
    seleccionar("#enlace-canonico")?.setAttribute("href", datos.configuracion.urlPublica);
    seleccionar("#og-titulo")?.setAttribute("content", datos.configuracion.tituloSeo);
    seleccionar("#og-descripcion")?.setAttribute("content", datos.configuracion.descripcionSeo);
    seleccionar("#og-url")?.setAttribute("content", datos.configuracion.urlPublica);
    seleccionar("#og-imagen")?.setAttribute("content", new URL(datos.persona.foto, datos.configuracion.urlPublica).href);
  }

  function renderizarHero(datos) {
    ponerTexto("#nav-iniciales", datos.persona.iniciales);
    ponerTexto("#nav-nombre", datos.persona.nombreCorto);
    ponerTexto("#nav-cargo", datos.persona.cargoPrincipal);
    ponerTexto("#hero-estado", datos.persona.estadoLaboral);
    ponerTexto("#hero-especialidad", datos.persona.especialidad);
    ponerTexto("#hero-nombre", datos.persona.nombre);
    ponerTexto("#cargo-dinamico", datos.persona.cargoPrincipal);
    ponerTexto("#hero-descripcion", datos.persona.frasePrincipal);
    ponerEnlace("#hero-github", datos.persona.github);
    ponerEnlace("#hero-linkedin", datos.persona.linkedin);

    const foto = seleccionar("#foto-perfil");
    if (foto) {
      foto.src = datos.persona.foto;
      foto.alt = `Fotografía profesional de ${datos.persona.nombre}`;
    }

    seleccionar("#datos-rapidos").innerHTML = `
      <div><dt>Ubicación</dt><dd>${escapar(datos.persona.ciudad)}, ${escapar(datos.persona.departamento)}</dd></div>
      <div><dt>Modalidad</dt><dd>${escapar(datos.persona.modalidad)}</dd></div>
      <div><dt>Idiomas</dt><dd>${datos.idiomas.map(i => escapar(`${i.nombre} ${i.descripcion}`)).join(" · ")}</dd></div>`;

    seleccionar("#indicadores-hero").innerHTML = datos.indicadores.map(indicador => `
      <div class="col-md-6 col-xl-3" data-aos="fade-up">
        <article class="tarjeta-indicador">
          <span><i class="${escapar(indicador.icono)}"></i></span>
          <div><strong>${escapar(indicador.valor)}</strong><small>${escapar(indicador.etiqueta)}</small></div>
        </article>
      </div>`).join("");
  }

  function renderizarSobreMi(datos) {
    ponerTexto("#sobre-mi-titulo", datos.sobreMi.titulo);
    seleccionar("#sobre-mi-texto").innerHTML = datos.sobreMi.parrafos.map(parrafo => `<p>${escapar(parrafo)}</p>`).join("");
    seleccionar("#roles-interes").innerHTML = datos.sobreMi.roles.map(rol => `<span><i class="fa-solid fa-check"></i>${escapar(rol)}</span>`).join("");
  }

  function renderizarTecnologias(datos) {
    seleccionar("#lista-tecnologias").innerHTML = datos.tecnologias.map(grupo => `
      <div class="col-md-6 col-xl-4" data-aos="fade-up">
        <article class="tarjeta tarjeta-tecnologia h-100">
          <span class="icono-tarjeta"><i class="${escapar(grupo.icono)}"></i></span>
          <h3>${escapar(grupo.categoria)}</h3>
          <div class="nube-etiquetas">${grupo.items.map(item => `<span>${escapar(item)}</span>`).join("")}</div>
        </article>
      </div>`).join("");
  }

  function renderizarExperiencia(datos) {
    seleccionar("#lista-experiencia").innerHTML = datos.experiencia.map(item => {
      const contenido = `
        <div class="experiencia-cabecera"><div><span class="etiqueta-periodo">${escapar(item.periodo)}</span><h3>${escapar(item.cargo)}</h3><p>${escapar(item.empresa)} · ${escapar(item.ubicacion)}</p></div><i class="fa-solid fa-building"></i></div>
        <ul>${item.funciones.map(funcion => `<li>${escapar(funcion)}</li>`).join("")}</ul>`;
      return item.archivoLaboral
        ? `<a class="tarjeta tarjeta-experiencia tarjeta-experiencia-enlace" href="${escapar(item.archivoLaboral)}" target="_blank" rel="noopener" title="Ver certificado laboral de ${escapar(item.empresa)}" data-aos="fade-up">${contenido}<span class="experiencia-ver-certificado"><i class="fa-solid fa-certificate"></i> Ver certificado laboral <i class="fa-solid fa-arrow-up-right-from-square"></i></span></a>`
        : `<article class="tarjeta tarjeta-experiencia" data-aos="fade-up">${contenido}</article>`;
    }).join("");
  }

  function renderizarProyectos(datos) {
    seleccionar("#lista-proyectos").innerHTML = datos.proyectos.map((proyecto, indice) => {
      const detalleId = `detalle-proyecto-${indice + 1}`;
      const evidencias = Array.isArray(proyecto.evidencias) ? proyecto.evidencias : [];
      const galeria = evidencias.length ? `<div class="proyecto-evidencias"><h4>Evidencias</h4><div>${evidencias.map((imagen, evidenciaIndice) => `<a href="${escapar(imagen)}" target="_blank" rel="noopener"><img src="${escapar(imagen)}" alt="Evidencia ${evidenciaIndice + 1} de ${escapar(proyecto.nombre)}" loading="lazy" /></a>`).join("")}</div></div>` : "";
      const videoArchivo = proyecto.videoArchivo ? `<div class="proyecto-video"><h4>Video del proyecto</h4><video controls preload="metadata"><source src="${escapar(proyecto.videoArchivo)}" />Tu navegador no puede reproducir este video.</video></div>` : "";
      const botonVideo = proyecto.video ? `<a class="btn btn-borde btn-sm" href="${escapar(proyecto.video)}" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i> Video</a>` : "";
      const portada = proyecto.imagen ? `<div class="proyecto-imagen"><img src="${escapar(proyecto.imagen)}" alt="Portada de ${escapar(proyecto.nombre)}" loading="lazy" /></div>` : `<div class="proyecto-imagen proyecto-sin-portada" aria-hidden="true"><i class="fa-solid fa-code"></i></div>`;
      const botonDemo = proyecto.demo
        ? `<a class="btn btn-borde btn-sm" href="${escapar(proyecto.demo)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>`
        : `<button class="btn btn-borde btn-sm" type="button" disabled title="La demostración todavía no es pública"><i class="fa-solid fa-lock"></i> Demo privada</button>`;
      return `
        <div class="col-lg-6" data-aos="fade-up">
          <article class="tarjeta-proyecto h-100">
            ${portada}
            <div class="proyecto-contenido">
              <div class="proyecto-encabezado"><div>${proyecto.destacado ? '<span class="proyecto-destacado">Proyecto principal</span>' : ''}<h3>${escapar(proyecto.nombre)}</h3><p class="proyecto-subtitulo">${escapar(proyecto.subtitulo)}</p></div><span class="proyecto-numero">0${indice + 1}</span></div>
              <p>${escapar(proyecto.descripcion)}</p>
              <div class="nube-etiquetas">${proyecto.tecnologias.map(t => `<span>${escapar(t)}</span>`).join("")}</div>
              <div class="proyecto-acciones"><a class="btn btn-primary btn-sm" href="${escapar(proyecto.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>${botonDemo}${botonVideo}<button class="btn btn-texto btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#${detalleId}" aria-expanded="false" aria-controls="${detalleId}">Más información <i class="fa-solid fa-chevron-down"></i></button></div>
              <div class="collapse proyecto-detalles" id="${detalleId}"><h4>Características</h4><ul>${(proyecto.caracteristicas || []).map(c => `<li>${escapar(c)}</li>`).join("")}</ul>${galeria}${videoArchivo}</div>
            </div>
          </article>
        </div>`;
    }).join("");
  }

  function renderizarEducacion(datos) {
    seleccionar("#lista-educacion").innerHTML = datos.educacion.map(item => {
      const contenido = `<span class="punto-tiempo"></span><div><h3>${escapar(item.programa)}</h3><p>${escapar(item.institucion)}</p><small>${escapar(item.periodo)} · ${escapar(item.detalle)}</small></div>`;
      return item.archivo
        ? `<a class="tarjeta-educacion tarjeta-educacion-enlace" href="${escapar(item.archivo)}" target="_blank" rel="noopener" title="Ver certificado de ${escapar(item.programa)}">${contenido}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i><span class="visually-hidden">Ver certificado</span></a>`
        : `<article class="tarjeta-educacion">${contenido}</article>`;
    }).join("");

    seleccionar("#lista-certificaciones").innerHTML = datos.certificaciones.map(item => {
      const contenido = `<span><strong>${escapar(item.nombre)}</strong><small>${escapar(item.entidad)}</small></span>`;
      return item.archivo
        ? `<a class="certificacion" href="${escapar(item.archivo)}" target="_blank" rel="noopener"><i class="fa-solid fa-certificate"></i>${contenido}<i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
        : `<div class="certificacion"><i class="fa-solid fa-certificate"></i>${contenido}</div>`;
    }).join("");
  }

  function renderizarHabilidadesIdiomas(datos) {
    seleccionar("#lista-habilidades").innerHTML = datos.habilidades.map(item => `<span>${escapar(item)}</span>`).join("");
    seleccionar("#lista-idiomas").innerHTML = datos.idiomas.map(item => `
      <div class="idioma"><div><strong>${escapar(item.nombre)}</strong><span>${escapar(item.descripcion)}</span></div><div class="barra-idioma" role="progressbar" aria-valuenow="${Number(item.nivel)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Number(item.nivel)}%"></span></div></div>`).join("");
  }

  function renderizarContacto(datos) {
    seleccionar("#datos-contacto").innerHTML = `
      <a href="mailto:${escapar(datos.persona.correo)}"><i class="fa-solid fa-envelope"></i><span><small>Correo</small><strong>${escapar(datos.persona.correo)}</strong></span></a>
      <a href="tel:${escapar(datos.persona.telefonoEnlace)}"><i class="fa-solid fa-phone"></i><span><small>Teléfono</small><strong>${escapar(datos.persona.telefonoVisible)}</strong></span></a>
      <a href="${escapar(datos.persona.linkedin)}" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i><span><small>LinkedIn</small><strong>Perfil profesional</strong></span></a>
      <a href="${escapar(datos.persona.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i><span><small>GitHub</small><strong>Repositorios</strong></span></a>`;
    ponerTexto("#nombre-footer", datos.persona.nombre);
    ponerTexto("#anio-actual", new Date().getFullYear());
  }

  function renderizarTodo() {
    const datos = window.PORTAFOLIO_DATOS;
    if (!datos) throw new Error("No se encontró PORTAFOLIO_DATOS.");
    actualizarSeo(datos);
    renderizarHero(datos);
    renderizarSobreMi(datos);
    renderizarTecnologias(datos);
    renderizarExperiencia(datos);
    renderizarProyectos(datos);
    renderizarEducacion(datos);
    renderizarHabilidadesIdiomas(datos);
    renderizarContacto(datos);
  }

  window.PortafolioRenderizado = { renderizarTodo };
})();
