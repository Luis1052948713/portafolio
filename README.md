# Portafolio profesional de Luis Barbosa

Portafolio dinámico con constructor visual, autenticación, publicación por usuario y almacenamiento multimedia.

- Sitio público: https://portafolio-wine-iota.vercel.app/
- Panel: https://portafolio-wine-iota.vercel.app/admin
- Producción: Vercel
- Código: GitHub
- Datos, usuarios y archivos: Supabase

## Actualizar contenido

El contenido se administra desde `/admin`; no es necesario editar los archivos JavaScript.

1. Inicia sesión.
2. Edita el borrador mediante los pasos del constructor.
3. Pulsa **Guardar borrador** para conservar cambios privados.
4. Pulsa **Generar y publicar todo** para actualizar el portafolio público.

Cada usuario aprobado tiene un borrador, archivos y publicación independientes.

## Desarrollo local

Abre la carpeta con Live Server en Visual Studio Code. Las páginas principales son:

```text
index.html       Portafolio público
admin.html       Constructor visual
```

La configuración pública de Supabase está en:

```text
assets/js/datos/supabase-config.js
```

La publishable key puede estar en el navegador. Nunca agregues una secret key o `service_role` key al repositorio.

## Estructura

```text
assets/
  css/                     Estilos públicos, administrativos y ATS
  documentos/certificados/ Certificados locales de respaldo
  favicon/                 Iconos del sitio
  img/perfil/              Fotografía local de respaldo
  img/proyectos/           Portadas locales de respaldo
  js/datos/                Configuración y datos locales de respaldo
  js/modulos/              Renderizado, Supabase, interacciones y PDF
supabase/                   Instalación y migraciones SQL
admin.html                  Constructor
index.html                  Sitio público
vercel.json                 Configuración de despliegue
```

## Supabase

Las instrucciones están en [SUPABASE.md](SUPABASE.md). Para una instalación existente, ejecuta las migraciones en el orden documentado.

Los datos locales de `portafolio-datos.js` se conservan únicamente como respaldo y para la importación inicial.

## Despliegue

La rama `main` está conectada con Vercel. Cada cambio de código enviado a GitHub genera un despliegue automático. Las actualizaciones hechas desde el panel se publican directamente desde Supabase y no requieren un nuevo despliegue.

## Compatibilidad

`sobremi.html` y `curriculum.html` se conservan como redirecciones para enlaces antiguos.