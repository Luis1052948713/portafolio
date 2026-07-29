/**
 * PUNTO DE INICIO DEL PORTAFOLIO
 * Carga primero el contenido remoto y conserva los datos locales como respaldo.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await window.PortafolioSupabase?.cargarContenido();
    const urlOficial = window.SUPABASE_CONFIG?.siteUrl;
    if (urlOficial && window.PORTAFOLIO_DATOS?.configuracion) window.PORTAFOLIO_DATOS.configuracion.urlPublica = urlOficial;
    window.PortafolioRenderizado.renderizarTodo();
    window.PortafolioInteracciones.iniciarTodo();
    window.PortafolioPdf.iniciar();
  } catch (error) {
    console.error("No fue posible iniciar el portafolio:", error);
  }
});