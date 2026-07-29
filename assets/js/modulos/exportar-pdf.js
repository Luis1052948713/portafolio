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

  function iniciar() {
    document.querySelectorAll("[data-descargar-cv]").forEach(boton => boton.addEventListener("click", descargarPdf));
    document.querySelector("#boton-imprimir")?.addEventListener("click", () => window.print());
  }

  window.PortafolioPdf = { iniciar, descargarPdf };
})();
