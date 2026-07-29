/**
 * EXPORTACIÓN DEL PORTAFOLIO A PDF
 * Usa html2canvas para capturar el diseño y jsPDF para crear las páginas.
 */
(() => {
  "use strict";

  const CONFIG = {
    anchoCaptura: 1200,
    escala: 1.2,
    fondoOscuro: "#090d16",
    fondoClaro: "#f6f8fc",
    ocultar: [".barra-navegacion", ".acciones-hero", ".acciones-secundarias", ".formulario-contacto", ".boton-subir", "[data-descargar-cv]", "#boton-imprimir"]
  };

  const esperar = tiempo => new Promise(resolver => setTimeout(resolver, tiempo));

  function estadoBotones(generando) {
    document.querySelectorAll("[data-descargar-cv]").forEach(boton => {
      if (!boton.dataset.original) boton.dataset.original = boton.innerHTML;
      boton.disabled = generando;
      boton.innerHTML = generando ? '<span class="spinner-border spinner-border-sm"></span> Generando PDF...' : boton.dataset.original;
    });
  }

  function limpiar(elemento) {
    CONFIG.ocultar.forEach(selector => elemento.querySelectorAll(selector).forEach(nodo => nodo.remove()));
    elemento.querySelectorAll("[data-aos]").forEach(nodo => {
      nodo.removeAttribute("data-aos");
      nodo.style.opacity = "1";
      nodo.style.transform = "none";
      nodo.style.visibility = "visible";
    });
    elemento.querySelectorAll("*").forEach(nodo => {
      nodo.style.animation = "none";
      nodo.style.transition = "none";
    });
  }

  function crearCopia(original) {
    const zona = document.createElement("div");
    Object.assign(zona.style,{position:"absolute",left:"-20000px",top:"0",width:`${CONFIG.anchoCaptura}px`,zIndex:"-99999",overflow:"visible"});
    const copia = original.cloneNode(true);
    copia.id = "documento-cv-pdf";
    copia.classList.add("copia-pdf");
    copia.style.width = `${CONFIG.anchoCaptura}px`;
    copia.style.maxWidth = `${CONFIG.anchoCaptura}px`;
    limpiar(copia);
    zona.appendChild(copia);
    document.body.appendChild(zona);
    return { zona, copia };
  }

  async function esperarImagenes(contenedor) {
    const tareas = [...contenedor.querySelectorAll("img")].map(imagen => {
      if (imagen.complete && imagen.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolver => {
        const terminar = () => resolver();
        imagen.addEventListener("load", terminar, {once:true});
        imagen.addEventListener("error", terminar, {once:true});
        setTimeout(terminar, 5000);
      });
    });
    await Promise.all(tareas);
  }

  function agregarPaginas(pdf, lienzo, fondo) {
    const anchoMm = 210;
    const altoMm = 297;
    const altoPaginaPx = Math.floor(lienzo.width * (altoMm / anchoMm));
    let y = 0;
    let pagina = 0;
    while (y < lienzo.height) {
      const altoRecorte = Math.min(altoPaginaPx, lienzo.height - y);
      const recorte = document.createElement("canvas");
      recorte.width = lienzo.width;
      recorte.height = altoRecorte;
      const contexto = recorte.getContext("2d");
      contexto.fillStyle = fondo;
      contexto.fillRect(0,0,recorte.width,recorte.height);
      contexto.drawImage(lienzo,0,y,lienzo.width,altoRecorte,0,0,lienzo.width,altoRecorte);
      if (pagina > 0) pdf.addPage("a4","portrait");
      const altoImagenMm = altoRecorte / lienzo.width * anchoMm;
      pdf.addImage(recorte.toDataURL("image/png"),"PNG",0,0,anchoMm,altoImagenMm,undefined,"FAST");
      y += altoRecorte;
      pagina += 1;
    }
  }

  async function descargarPdf() {
    const original = document.querySelector("#documento-cv");
    if (!original) return alert("No se encontró el contenido del portafolio.");
    if (typeof window.html2canvas !== "function" || !window.jspdf?.jsPDF) return alert("No se cargaron las librerías de PDF. Revisa la conexión a internet.");
    estadoBotones(true);
    let temporal;
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      temporal = crearCopia(original);
      await esperarImagenes(temporal.copia);
      await esperar(350);
      const tema = document.documentElement.getAttribute("data-bs-theme");
      const fondo = tema === "light" ? CONFIG.fondoClaro : CONFIG.fondoOscuro;
      const lienzo = await window.html2canvas(temporal.copia,{scale:CONFIG.escala,useCORS:true,allowTaint:false,backgroundColor:fondo,logging:false,scrollX:0,scrollY:0,windowWidth:CONFIG.anchoCaptura,windowHeight:temporal.copia.scrollHeight,foreignObjectRendering:false});
      const pdf = new window.jspdf.jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
      agregarPaginas(pdf,lienzo,fondo);
      pdf.save(window.PORTAFOLIO_DATOS?.configuracion?.archivoPdf || "hoja-de-vida.pdf");
    } catch (error) {
      console.error(error);
      alert(`No fue posible crear el PDF visual.\n\nDetalle técnico: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      temporal?.zona?.remove();
      estadoBotones(false);
      window.AOS?.refreshHard();
    }
  }

  const escaparAts = (valor = "") => String(valor).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const listaAts = items => `<ul>${(items || []).map(item => `<li>${escaparAts(item)}</li>`).join("")}</ul>`;

  function crearDocumentoAts(datos) {
    const p = datos.persona || {}, sobre = datos.sobreMi || {};
    const tecnologias = (datos.tecnologias || []).flatMap(grupo => grupo.items || []);
    const experiencia = (datos.experiencia || []).map(item => `<article><h3>${escaparAts(item.cargo)}</h3><p class="meta"><strong>${escaparAts(item.empresa)}</strong> | ${escaparAts(item.ubicacion)} | ${escaparAts(item.periodo)}</p>${listaAts(item.funciones)}</article>`).join("");
    const proyectos = (datos.proyectos || []).map(item => `<article><h3>${escaparAts(item.nombre)}</h3><p class="meta">${escaparAts(item.subtitulo)}</p><p>${escaparAts(item.descripcion)}</p>${item.tecnologias?.length ? `<p><strong>Tecnologías:</strong> ${item.tecnologias.map(escaparAts).join(", ")}</p>` : ""}${listaAts(item.caracteristicas)}${item.github ? `<p><strong>Repositorio:</strong> ${escaparAts(item.github)}</p>` : ""}${item.demo ? `<p><strong>Demostración:</strong> ${escaparAts(item.demo)}</p>` : ""}</article>`).join("");
    const educacion = (datos.educacion || []).map(item => `<article><h3>${escaparAts(item.programa)}</h3><p class="meta"><strong>${escaparAts(item.institucion)}</strong> | ${escaparAts(item.periodo)} | ${escaparAts(item.detalle)}</p></article>`).join("");
    const certificados = (datos.certificaciones || []).map(item => `<li><strong>${escaparAts(item.nombre)}</strong> — ${escaparAts(item.entidad)}</li>`).join("");
    const idiomas = (datos.idiomas || []).map(item => `<li><strong>${escaparAts(item.nombre)}:</strong> ${escaparAts(item.descripcion)}</li>`).join("");
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de vida ATS - ${escaparAts(p.nombre)}</title><style>
      @page{size:A4;margin:14mm}*{box-sizing:border-box}body{max-width:190mm;margin:0 auto;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.38}header{padding-bottom:10px;border-bottom:2px solid #111}h1{margin:0 0 3px;font-size:24pt}header h2{margin:0 0 8px;font-size:12pt;font-weight:600}header p{margin:2px 0}a{color:#111;text-decoration:none}section{margin-top:15px}h2{margin:0 0 8px;padding-bottom:3px;border-bottom:1px solid #555;font-size:13pt;text-transform:uppercase}h3{margin:9px 0 2px;font-size:11pt}p{margin:4px 0}.meta{color:#333}ul{margin:5px 0 8px;padding-left:19px}li{margin-bottom:2px}article{break-inside:avoid;page-break-inside:avoid}.etiquetas{margin:0}.acciones{position:fixed;right:16px;top:16px}@media print{.acciones{display:none}}@media screen{body{padding:24px}.acciones button{padding:9px 14px}}
    </style></head><body><button class="acciones" onclick="window.print()">Imprimir / Guardar PDF</button><header><h1>${escaparAts(p.nombre)}</h1><h2>${escaparAts(p.cargoPrincipal)}</h2><p>${[p.ciudad,p.departamento,p.pais].filter(Boolean).map(escaparAts).join(", ")} | ${escaparAts(p.telefonoVisible)} | ${escaparAts(p.correo)}</p><p>LinkedIn: ${escaparAts(p.linkedin)} | GitHub: ${escaparAts(p.github)}</p></header>
    <main><section><h2>Perfil profesional</h2>${(sobre.parrafos || []).map(texto => `<p>${escaparAts(texto)}</p>`).join("")}</section>
    <section><h2>Competencias técnicas</h2><p class="etiquetas">${tecnologias.map(escaparAts).join(" • ")}</p></section>
    <section><h2>Experiencia profesional</h2>${experiencia || "<p>Sin experiencia registrada.</p>"}</section>
    <section><h2>Proyectos</h2>${proyectos || "<p>Sin proyectos registrados.</p>"}</section>
    <section><h2>Educación</h2>${educacion}</section>
    <section><h2>Certificaciones</h2><ul>${certificados}</ul></section>
    <section><h2>Habilidades</h2>${listaAts(datos.habilidades)}</section>
    <section><h2>Idiomas</h2><ul>${idiomas}</ul></section></main></body></html>`;
  }

  function abrirVersionAts() {
    const ventana = window.open("","_blank");
    if (!ventana) return alert("Permite las ventanas emergentes para abrir la versión ATS.");
    ventana.opener = null;
    ventana.document.open();
    ventana.document.write(crearDocumentoAts(window.PORTAFOLIO_DATOS || {}));
    ventana.document.close();
  }

  function iniciar() {
    document.querySelectorAll("[data-descargar-cv]").forEach(boton => boton.addEventListener("click", descargarPdf));
    document.querySelector("#boton-imprimir")?.addEventListener("click", abrirVersionAts);
  }

  window.PortafolioPdf = { iniciar, descargarPdf, abrirVersionAts };
})();
