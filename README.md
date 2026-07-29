# Portafolio profesional de Luis Barbosa

Este proyecto reemplaza la versión anterior del repositorio `portafolio` y conserva la dirección de GitHub Pages:

```text
https://luis1052948713.github.io/portafolio/
```

## La regla más importante

Para cambiar textos, enlaces, experiencia, proyectos o estudios, abre solamente:

```text
assets/js/datos/portafolio-datos.js
```

No necesitas tocar normalmente `index.html`, los módulos de JavaScript ni los estilos.

## Estructura organizada

```text
portafolio/
├── index.html
├── sobremi.html                 # Redirección compatible con el enlace antiguo
├── curriculum.html              # Redirección compatible con el enlace antiguo
├── README.md
├── robots.txt
├── sitemap.xml
├── .nojekyll
│
└── assets/
    ├── css/
    │   ├── variables.css        # Colores, fuentes y medidas principales
    │   ├── estilos.css          # Diseño general y componentes
    │   ├── responsive.css       # Adaptación para celular y tableta
    │   └── impresion.css        # PDF y versión ATS
    │
    ├── js/
    │   ├── datos/
    │   │   └── portafolio-datos.js  # Archivo principal para editar
    │   ├── modulos/
    │   │   ├── renderizado.js       # Construye el contenido
    │   │   ├── interacciones.js     # Tema, navegación y formulario
    │   │   └── exportar-pdf.js      # Descarga del PDF
    │   └── app.js                   # Inicia los módulos
    │
    ├── img/
    │   ├── perfil/
    │   ├── proyectos/
    │   └── redes/
    │
    ├── documentos/
    │   ├── certificados/
    │   └── hoja-de-vida/
    │
    └── favicon/
```

## Nomenclatura utilizada

Todo archivo nuevo debe seguir estas reglas:

1. Nombres en minúscula.
2. Sin espacios.
3. Sin tildes ni `ñ`.
4. Palabras separadas con guiones.
5. El nombre debe explicar el contenido.

Correcto:

```text
certificado-aws-cloud-foundations.pdf
quickserve-pos-portada.jpg
portafolio-datos.js
```

Evita:

```text
Certificado Luis FINAL (2).pdf
perfil (1).jpg
Mi Proyecto Nuevo.jpg
```

## Cambiar la información personal

Abre `assets/js/datos/portafolio-datos.js` y busca:

```javascript
persona: {
  nombre: "Luis Fernando Barbosa Orozco",
  cargoPrincipal: "Software Developer",
  correo: "luisfernandobarbosaorozco7@gmail.com"
}
```

Cambia solamente los textos que están entre comillas.

## Cambiar la foto

Reemplaza:

```text
assets/img/perfil/luis-barbosa-perfil.jpg
```

Conserva el mismo nombre para no modificar el código.

## Agregar un proyecto

En `portafolio-datos.js`, busca `proyectos` y copia un bloque completo:

```javascript
{
  destacado: false,
  nombre: "Nombre del proyecto",
  subtitulo: "Tipo de proyecto",
  imagen: "assets/img/proyectos/nombre-del-proyecto.jpg",
  descripcion: "Descripción clara.",
  tecnologias: ["React", "TypeScript"],
  caracteristicas: [
    "Primera característica.",
    "Segunda característica."
  ],
  github: "https://github.com/usuario/repositorio",
  demo: ""
}
```

Cuando `demo` queda vacío, el sitio muestra `Demo privada`.

## Cambiar los colores

Abre:

```text
assets/css/variables.css
```

Las variables principales son:

```css
--color-principal: #7c5cff;
--color-secundario: #2dd4bf;
--fondo: #090d16;
```

## Abrir en el computador

La forma recomendada es utilizar Live Server en Visual Studio Code.

También puede abrirse con doble clic, pero el servidor local evita restricciones de algunas imágenes y funciones del navegador.

## Publicar en GitHub Pages

1. Reemplaza el contenido del repositorio `portafolio` por este proyecto.
2. Sube todos los archivos.
3. En GitHub abre `Settings` → `Pages`.
4. Selecciona `Deploy from a branch`.
5. Usa la rama `main` y la carpeta `/root`.
6. Guarda los cambios.

## Archivos conservados del proyecto anterior

Se conservaron y reorganizaron:

- Fotografía de perfil.
- Imagen de perfil recortada.
- Certificado AWS Academy Cloud Foundations.
- Certificado de formulación de proyectos de alto impacto.
- Enlaces antiguos `sobremi.html` y `curriculum.html` mediante redirección.

## Panel de administración

El proyecto incluye `admin.html`, un constructor completo para administrar identidad, fotografía, perfil, tecnologías, experiencias, proyectos, evidencias, videos, estudios, certificaciones, habilidades e idiomas desde el navegador. La configuración completa está en [SUPABASE.md](SUPABASE.md) y el esquema seguro en `supabase/setup.sql`.

Mientras Supabase no esté configurado, el portafolio continúa usando `assets/js/datos/portafolio-datos.js` como respaldo.