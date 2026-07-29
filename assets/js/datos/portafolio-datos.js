/**
 * ==================================================================
 * ARCHIVO PRINCIPAL PARA EDITAR EL PORTAFOLIO
 * ==================================================================
 *
 * Este es el archivo que debes abrir cuando quieras cambiar:
 * - Nombre, cargo y contacto.
 * - Textos del perfil.
 * - Tecnologías.
 * - Experiencia.
 * - Proyectos.
 * - Educación y certificados.
 *
 * REGLAS SENCILLAS:
 * 1. Cambia únicamente el texto que está entre comillas.
 * 2. Conserva las comas, llaves { } y corchetes [ ].
 * 3. Para agregar un elemento, copia un bloque parecido completo.
 */

const PORTAFOLIO_DATOS = {
  configuracion: {
    urlPublica: "https://portafolio-wine-iota.vercel.app/",
    tituloSeo: "Luis Fernando Barbosa Orozco | Software Developer",
    descripcionSeo:
      "Portafolio profesional de Luis Fernando Barbosa Orozco, desarrollador especializado en React Native, Expo, TypeScript, SQLite y Supabase.",
    archivoPdf: "Luis_Fernando_Barbosa_Orozco_Hoja_de_Vida.pdf",
  },

  persona: {
    nombre: "Luis Fernando Barbosa Orozco",
    nombreCorto: "Luis Barbosa",
    iniciales: "LB",
    cargoPrincipal: "Software Developer",
    cargosAlternativos: [
      "React Native Developer",
      "Frontend Developer",
      "Mobile Developer",
      "Full Stack Developer",
    ],
    especialidad: "React Native · TypeScript · Software Architecture",
    frasePrincipal:
      "Construyo aplicaciones móviles y software empresarial moderno, escalable y fácil de usar.",
    estadoLaboral: "Disponible para nuevas oportunidades",
    ciudad: "Magangué",
    departamento: "Bolívar",
    pais: "Colombia",
    modalidad: "Remoto · Híbrido",
    telefonoVisible: "+57 302 208 1692",
    telefonoEnlace: "+573022081692",
    correo: "luisfernandobarbosaorozco7@gmail.com",
    github: "https://github.com/Luis1052948713",
    linkedin: "https://www.linkedin.com/in/luis-2004barbosa-21orozco/",
    foto: "assets/img/perfil/luis-barbosa-recorte.png",
  },

  sobreMi: {
    titulo:
      "Ingeniería enfocada en producto, negocio y experiencia de usuario.",
    parrafos: [
      "Tecnólogo en Análisis y Desarrollo de Software egresado del SENA y estudiante de noveno semestre de Ingeniería de Software en la Universidad de Cartagena.",
      "Apasionado por el desarrollo de aplicaciones móviles, software empresarial y arquitectura de sistemas. Especializado en React Native, Expo, TypeScript, SQLite y Supabase.",
      "Me gusta desarrollar productos modernos, escalables y con excelente experiencia de usuario. Busco oportunidades donde pueda aportar en proyectos reales y continuar creciendo profesionalmente.",
    ],
    roles: [
      "Software Developer",
      "React Native Developer",
      "Frontend Developer",
      "Mobile Developer",
      "Full Stack Developer",
    ],
  },

  tecnologias: [
    {
      categoria: "Lenguajes",
      icono: "fa-solid fa-code",
      items: ["TypeScript", "JavaScript", "SQL", "HTML5", "CSS3"],
    },
    {
      categoria: "Frameworks",
      icono: "fa-brands fa-react",
      items: [
        "React Native",
        "React",
        "Expo SDK 54",
        "Expo Router",
        "React Navigation",
        "React Native Web",
      ],
    },
    {
      categoria: "Bases de datos",
      icono: "fa-solid fa-database",
      items: ["SQLite", "Supabase", "PostgreSQL", "JSON"],
    },
    {
      categoria: "Herramientas",
      icono: "fa-solid fa-screwdriver-wrench",
      items: [
        "Git",
        "GitHub",
        "VS Code",
        "Android Studio",
        "Expo CLI",
        "EAS Build",
        "Metro",
        "ESLint",
        "Postman",
      ],
    },
    {
      categoria: "Arquitectura",
      icono: "fa-solid fa-diagram-project",
      items: [
        "Repository Pattern",
        "Services",
        "Migrations",
        "Offline First",
        "Responsive Design",
        "Material Design 3",
      ],
    },
  ],

  experiencia: [
    {
      empresa: "Cámara de Comercio de Magangué",
      cargo: "Practicante Tecnólogo",
      periodo: "2025 – 2026",
      ubicacion: "Magangué, Bolívar",
      archivoLaboral:
        "assets/documentos/certificados/Certificado laboral el Sena.pdf",
      funciones: [
        "Gestión documental mediante SGDEA.",
        "Digitalización y organización documental.",
        "Administración y actualización de bases de datos.",
        "Control de inventarios y apoyo a procesos administrativos.",
        "Generación de reportes y consolidación de información.",
        "Trabajo colaborativo con diferentes áreas de la organización.",
      ],
    },
  ],

  proyectos: [
    {
      destacado: true,
      nombre: "MAG-COB01",
      subtitulo: "Aplicación Fintech profesional",
      imagen: "assets/img/proyectos/cobros.jpg",
      descripcion:
        "Aplicación multiplataforma para gestionar clientes, préstamos, pagos, cuotas, caja, rutas de cobro, reportes y copias de seguridad, diseñada con arquitectura offline-first.",
      tecnologias: [
        "React Native 0.81.5",
        "React 19.1",
        "Expo SDK 54",
        "TypeScript",
        "SQLite",
        "Supabase",
        "Expo Router",
      ],
      caracteristicas: [
        "Sistema Offline First con SQLite local.",
        "Migraciones automáticas y Repository Pattern.",
        "Gestión de clientes, préstamos, pagos y cuotas.",
        "Caja, historiales, dashboard y reportes.",
        "Generación de PDF y copias de seguridad JSON.",
        "Compatible con Android, iOS y Web.",
      ],
      github: "https://github.com/Luis1052948713?tab=repositories",
      demo: "",
    },
    {
      destacado: false,
      nombre: "QuickServe POS Enterprise",
      subtitulo: "Sistema POS para restaurantes",
      imagen: "assets/img/proyectos/quickserve-pos-portada.jpg",
      descripcion:
        "Sistema empresarial para administrar la operación diaria de restaurantes desde pedidos y cocina hasta caja, clientes, ventas y reportes.",
      tecnologias: ["React Native", "Expo", "TypeScript", "SQLite", "Supabase"],
      caracteristicas: [
        "Gestión de productos y categorías.",
        "Pedidos y pantalla de cocina KDS.",
        "Caja, clientes y ventas.",
        "Dashboard, reportes y panel administrativo.",
        "Arquitectura preparada para trabajo local y sincronización.",
      ],
      github: "https://github.com/Luis1052948713?tab=repositories",
      demo: "",
    },
  ],

  educacion: [
    {
      programa: "Ingeniería de Software",
      institucion: "Universidad de Cartagena",
      periodo: "2022 – Actualidad",
      detalle: "Noveno semestre",
      archivo: "",
    },
    {
      programa: "Tecnólogo en Análisis y Desarrollo de Software",
      institucion: "SENA",
      periodo: "2023 – 2026",
      detalle: "Formación tecnológica",
      archivo:
        "assets/documentos/certificados/certificado del sena tecnologo.pdf",
    },
    {
      programa: "Técnico Laboral en Inglés B2",
      institucion: "Fundación Elyon Yireh",
      periodo: "Finalizado",
      detalle: "Nivel B2",
      archivo: "assets/documentos/certificados/CERTIFICADO DE INGLES.pdf",
    },
    {
      programa: "Bachiller Académico",
      institucion: "Institución Educativa San Mateo",
      periodo: "Finalizado",
      detalle: "Educación media",
      archivo:
        "assets/documentos/certificados/diploma de bachiller academico.pdf",
    },
  ],

  certificaciones: [
    {
      nombre: "AWS Academy Cloud Foundations",
      entidad: "AWS Academy",
      archivo: "assets/documentos/certificados/aws-cloud-foundations.pdf",
    },
    {
      nombre: "Formulación de proyectos de alto impacto",
      entidad: "Formación complementaria",
      archivo:
        "assets/documentos/certificados/formulacion-proyectos-alto-impacto.pdf",
    },
    {
      nombre: "Excel",
      entidad: "Formación complementaria",
      archivo: "assets/documentos/certificados/CERTIFICADO DE EXCEL.pdf",
    },
    {
      nombre: "Auditoría Interna",
      entidad: "Formación complementaria",
      archivo:
        "assets/documentos/certificados/CERTIFICADO DE AUDITORIA INTERNA.pdf",
    },
    {
      nombre: "Bootcamp de Análisis de Datos",
      entidad: "Formación complementaria",
      archivo:
        "assets/documentos/certificados/certificado curso analisis de datos nivel basico.pdf",
    },
    {
      nombre: "MARCO LOGICO DE PROYECTOS: IDENTIFICACION Y ANALISIS",
      entidad: "Formación complementaria",
      archivo:
        "assets/documentos/certificados/CERTIFICADO MARCO LOGICO DE PROYECTOS.pdf",
    },
  ],

  habilidades: [
    "Trabajo en equipo",
    "Pensamiento analítico",
    "Aprendizaje continuo",
    "Resolución de problemas",
    "Comunicación",
    "Adaptabilidad",
    "Liderazgo",
  ],

  idiomas: [
    { nombre: "Español", descripcion: "Nativo", nivel: 100 },
    { nombre: "Inglés", descripcion: "B2", nivel: 70 },
  ],

  indicadores: [
    {
      valor: "2 productos",
      etiqueta: "Proyectos principales",
      icono: "fa-solid fa-layer-group",
    },
    {
      valor: "Android · iOS · Web",
      etiqueta: "Desarrollo multiplataforma",
      icono: "fa-solid fa-mobile-screen",
    },
    {
      valor: "Offline First",
      etiqueta: "Arquitecturas resilientes",
      icono: "fa-solid fa-cloud-arrow-down",
    },
    {
      valor: "9.º semestre",
      etiqueta: "Ingeniería de Software",
      icono: "fa-solid fa-graduation-cap",
    },
  ],
};

window.PORTAFOLIO_DATOS = PORTAFOLIO_DATOS;
