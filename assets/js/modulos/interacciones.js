/**
 * INTERACCIONES GENERALES
 * Tema, navegación, animaciones, formulario y botón para volver arriba.
 */
(() => {
  "use strict";

  function iniciarAnimaciones() {
    window.AOS?.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 65, disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }

  function iniciarTema() {
    const raiz = document.documentElement;
    const boton = document.querySelector("#boton-tema");
    const guardado = localStorage.getItem("tema-portafolio");
    const preferido = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

    function aplicar(tema) {
      raiz.setAttribute("data-bs-theme", tema);
      localStorage.setItem("tema-portafolio", tema);
      const icono = boton?.querySelector("i");
      icono?.classList.toggle("fa-sun", tema === "dark");
      icono?.classList.toggle("fa-moon", tema === "light");
      boton?.setAttribute("aria-label", tema === "dark" ? "Activar tema claro" : "Activar tema oscuro");
    }

    aplicar(guardado || preferido);
    boton?.addEventListener("click", () => aplicar(raiz.getAttribute("data-bs-theme") === "dark" ? "light" : "dark"));
  }

  function iniciarNavegacion() {
    const barra = document.querySelector(".barra-navegacion");
    const enlaces = [...document.querySelectorAll(".barra-navegacion .nav-link[href^='#']")];
    const secciones = [...document.querySelectorAll("main section[id], main header[id]")];
    const actualizarBarra = () => barra?.classList.toggle("con-fondo", window.scrollY > 20);
    actualizarBarra();
    window.addEventListener("scroll", actualizarBarra, { passive: true });

    const observador = new IntersectionObserver(entradas => {
      const visible = entradas.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      enlaces.forEach(e => e.classList.toggle("active", e.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-32% 0px -55% 0px", threshold: [0.08,0.25,0.5] });
    secciones.forEach(s => observador.observe(s));

    enlaces.forEach(enlace => enlace.addEventListener("click", () => {
      const menu = document.querySelector("#menu-principal");
      if (menu?.classList.contains("show") && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }));
  }

  function iniciarBotonSubir() {
    const boton = document.querySelector("#boton-subir");
    const actualizar = () => boton?.classList.toggle("visible", window.scrollY > 700);
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    boton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function iniciarCargoDinamico() {
    const elemento = document.querySelector("#cargo-dinamico");
    const cargos = window.PORTAFOLIO_DATOS?.persona?.cargosAlternativos || [];
    if (!elemento || cargos.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let indice = 0;
    window.setInterval(async () => {
      await elemento.animate([{opacity:1,transform:"translateY(0)"},{opacity:0,transform:"translateY(-5px)"}],{duration:180,fill:"forwards"}).finished;
      indice = (indice + 1) % cargos.length;
      elemento.textContent = cargos[indice];
      elemento.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"translateY(0)"}],{duration:220,fill:"forwards"});
    }, 3000);
  }

  function iniciarFormulario() {
    const formulario = document.querySelector("#formulario-contacto");
    const correoDestino = window.PORTAFOLIO_DATOS?.persona?.correo;
    if (!formulario || !correoDestino) return;
    formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      evento.stopPropagation();
      formulario.classList.add("was-validated");
      if (!formulario.checkValidity()) return;
      const datos = new FormData(formulario);
      const asunto = datos.get("asunto")?.toString().trim() || "Contacto desde el portafolio";
      const cuerpo = [`Nombre: ${datos.get("nombre")}`, `Correo: ${datos.get("correo")}`, "", datos.get("mensaje")].join("\n");
      window.location.href = `mailto:${correoDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    });
  }

  function iniciarTodo() {
    iniciarAnimaciones();
    iniciarTema();
    iniciarNavegacion();
    iniciarBotonSubir();
    iniciarCargoDinamico();
    iniciarFormulario();
  }

  window.PortafolioInteracciones = { iniciarTodo };
})();
