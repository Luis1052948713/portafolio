/**
 * Carga la versión publicada desde Supabase.
 * Si el constructor todavía no se ha publicado, intenta el modelo anterior y finalmente usa datos locales.
 */
(() => {
  "use strict";

  function estaConfigurado() {
    const config = window.SUPABASE_CONFIG || {};
    return Boolean(config.url && config.publishableKey && window.supabase?.createClient);
  }

  function obtenerCliente() {
    if (!estaConfigurado()) return null;
    if (!window.PortafolioSupabaseCliente) {
      const { url, publishableKey } = window.SUPABASE_CONFIG;
      window.PortafolioSupabaseCliente = window.supabase.createClient(url, publishableKey);
    }
    return window.PortafolioSupabaseCliente;
  }

  function combinar(base, remoto) {
    if (Array.isArray(remoto)) return remoto;
    if (!remoto || typeof remoto !== "object") return remoto ?? base;
    const resultado = { ...(base || {}) };
    Object.entries(remoto).forEach(([clave, valor]) => { resultado[clave] = combinar(base?.[clave], valor); });
    return resultado;
  }

  async function cargarModeloAnterior(cliente) {
    const { data, error } = await cliente.from("portfolio_items").select("id,tipo,contenido,orden").eq("activo", true).order("orden", { ascending: true });
    if (error) throw error;
    if (!data?.length) return false;
    ["experiencia", "educacion", "certificacion"].forEach(tipo => {
      const propiedad = tipo === "certificacion" ? "certificaciones" : tipo;
      window.PORTAFOLIO_DATOS[propiedad] = data.filter(item => item.tipo === tipo && item.contenido).map(item => ({ ...item.contenido, idSupabase: item.id }));
    });
    return true;
  }

  async function cargarContenido() {
    const cliente = obtenerCliente();
    if (!cliente) return { origen: "local", datos: window.PORTAFOLIO_DATOS };
    try {
      const slugSolicitado = new URLSearchParams(window.location.search).get("portfolio");
      const consultaPublicada = slugSolicitado
        ? cliente.rpc("obtener_portafolio_publicado", { slug_solicitado: slugSolicitado })
        : cliente.rpc("obtener_portafolio_publicado");
      const { data: publicado, error } = await consultaPublicada;
      if (!error && publicado && typeof publicado === "object" && Object.keys(publicado).length) {
        window.PORTAFOLIO_DATOS = combinar(window.PORTAFOLIO_DATOS, publicado);
        return { origen: "constructor", datos: window.PORTAFOLIO_DATOS };
      }
      if (slugSolicitado) return { origen: "portafolio-sin-publicar", datos: window.PORTAFOLIO_DATOS };
      const cargoAnterior = await cargarModeloAnterior(cliente);
      return { origen: cargoAnterior ? "supabase-anterior" : "local", datos: window.PORTAFOLIO_DATOS };
    } catch (error) {
      console.warn("No fue posible cargar Supabase; se usarán los datos locales.", error);
      return { origen: "local", datos: window.PORTAFOLIO_DATOS, error };
    }
  }

  window.PortafolioSupabase = { estaConfigurado, obtenerCliente, cargarContenido };
})();