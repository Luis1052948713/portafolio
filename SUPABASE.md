# Configurar el panel con Supabase

El portafolio funciona normalmente con los datos locales mientras completas estos pasos. Cuando conectes Supabase, podrás administrar el contenido desde `admin.html`.

## 1. Crear el proyecto

1. Entra en [Supabase](https://supabase.com/dashboard) y crea un proyecto.
2. Abre **Authentication → Users** y crea tu usuario administrador con correo y contraseña.
3. Confirma el correo si el proyecto tiene esa opción activa.

## 2. Crear la base de datos y los permisos

1. Abre `supabase/setup.sql`.
2. En la última consulta, cambia `TU_CORREO_ADMIN@EJEMPLO.COM` por el correo del usuario que acabas de crear.
3. Copia el archivo completo en **SQL Editor** y ejecútalo.
4. Comprueba que existen la tabla `portfolio_items` y el bucket `portafolio`.

El SQL activa Row Level Security: los visitantes únicamente pueden leer registros visibles; solo el usuario registrado como administrador puede crear, editar, ocultar, eliminar o subir PDF.

## 3. Conectar el sitio

En Supabase abre **Project Settings → API** y copia:

- Project URL.
- Publishable key (también puede aparecer como `anon public` en proyectos anteriores).

Edita `assets/js/datos/supabase-config.js`:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  publishableKey: "TU_PUBLISHABLE_KEY",
  bucket: "portafolio",
};
```

La publishable key está diseñada para utilizarse en el navegador. No coloques nunca una `service_role` key en este proyecto.

## 4. Importar el contenido actual

1. Publica los cambios o abre el proyecto con Live Server.
2. Entra en `admin.html`.
3. Inicia sesión.
4. Pulsa **Importar datos actuales** una sola vez.

A partir de ese momento puedes crear, editar, ordenar, ocultar y eliminar contenido desde el panel. Los certificados nuevos se suben directamente como PDF.

## Solución de problemas

- **El panel dice que falta configuración:** revisa URL y publishable key.
- **Inicia sesión pero no permite editar:** vuelve a ejecutar la última consulta de `setup.sql` con el correo correcto.
- **No sube un PDF:** debe ser PDF, pesar máximo 10 MB y el SQL debe haberse ejecutado completamente.
- **El sitio muestra los datos antiguos:** si Supabase está vacío o no responde, el portafolio usa automáticamente los datos locales como respaldo.
## Activar el constructor completo

Si ya habías ejecutado `setup.sql`, ejecuta ahora `supabase/upgrade-constructor.sql` completo en **Supabase → SQL Editor**.

Esta actualización agrega:

- Borrador privado.
- Publicación completa con un solo botón.
- Datos personales y foto de perfil.
- Perfil, tecnologías e indicadores.
- Experiencias y certificados laborales.
- Proyectos con portada, galería de evidencias y videos.
- Estudios, cursos, habilidades e idiomas.
- Imágenes, PDF y videos de hasta 50 MB por archivo.

Después abre `admin.html`, pulsa **Usar datos actuales**, recorre los pasos y finaliza con **Generar y publicar todo**.

Los cambios guardados como borrador no son visibles públicamente. Únicamente el botón final reemplaza la versión publicada.