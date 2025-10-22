# Sistema de Gestión Ganadera

Un sistema web integral para la gestión de operaciones ganaderas, incluyendo administración de fincas, seguimiento de animales, registros sanitarios, gestión financiera y análisis de datos.

## Características

- **Gestión de Fincas**: Administra múltiples fincas, lotes y áreas de terreno
- **Seguimiento de Animales**: Operaciones CRUD completas para ganado con registros detallados
- **Registros Sanitarios**: Seguimiento de visitas veterinarias, vacunaciones y estado de salud
- **Seguimiento de Movimientos**: Registro de movimientos de animales entre fincas y lotes
- **Gestión de Sacrificio**: Seguimiento de producción de carne y rendimientos
- **Gestión de Proveedores**: Administración de proveedores y registros de compras
- **Seguimiento Financiero**: Monitoreo de costos, ingresos y rentabilidad
- **Gestión Nutricional**: Creación y asignación de raciones de alimento a animales
- **Panel de Análisis**: Visualización de métricas de rendimiento e información
- **Soporte de Carga de Archivos**: Subida de certificados y documentos

## Tecnologías Utilizadas

- **Backend**: Python Flask con SQLAlchemy
- **Base de Datos**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Manejo de Archivos**: Werkzeug para cargas de archivos seguras

## Instalación

### Prerrequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Instrucciones de Configuración

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/jpcc51/thesis-repo.git
   cd thesis-repo
   ```

2. **Crea y activa el entorno virtual:**
   ```bash
   cd Backend
   python -m venv .venv
   # En Windows:
   .venv\Scripts\activate
   # En macOS/Linux:
   source .venv/bin/activate
   ```

3. **Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecuta la aplicación:**
   ```bash
   python app.py
   ```

5. **Accede a la aplicación:**
   Abre tu navegador y navega a: http://localhost:5000

## Base de Datos

La aplicación utiliza una base de datos SQLite que se crea automáticamente cuando ejecutas la aplicación por primera vez. La base de datos incluye las siguientes tablas principales:

- `fincas` - Información de fincas
- `lotes` - Lotes de terreno dentro de las fincas
- `bovinos` - Animales de ganado
- `registros_sanitarios` - Registros sanitarios
- `movimientos_animales` - Movimientos de animales
- `pesajes_canales` - Pesos de canales
- `proveedores` - Proveedores
- `insumos` - Suministros e insumos
- `compras` - Registros de compras
- `ventas` - Registros de ventas
- `alimentacion` - Raciones de alimento
- Y más...

## Estructura del Proyecto

```
thesis-repo/
├── Backend/
│   ├── app.py                 # Aplicación principal de Flask
│   ├── create_db.py          # Script de creación de base de datos
│   ├── requirements.txt       # Dependencias de Python
│   ├── livestock.db          # Base de datos SQLite (auto-generada)
│   ├── uploads/              # Directorio de archivos subidos
│   └── .venv/                # Entorno virtual (no en el repo)
├── Frontend/
│   ├── script.js             # JavaScript del frontend
│   └── styles.css            # Estilos CSS
├── index.html                # Página principal HTML
├── .gitignore               # Reglas de ignorar de Git
├── README.md                # Este archivo
└── architecture_plan.md     # Documentación de arquitectura del sistema
```

## Endpoints de la API

La aplicación proporciona endpoints RESTful para todas las operaciones de datos:

- `GET/POST /api/fincas` - Gestión de fincas
- `GET/POST /api/lotes` - Gestión de lotes de terreno
- `GET/POST /api/bovinos` - Gestión de animales
- `GET/POST /api/registros_sanitarios` - Registros sanitarios
- `GET/POST /api/movimientos_animales` - Movimientos de animales
- `GET/POST /api/pesajes_canales` - Registros de sacrificio
- `GET/POST /api/proveedores` - Gestión de proveedores
- `GET/POST /api/insumos` - Gestión de suministros
- `GET/POST /api/compras` - Gestión de compras
- `GET/POST /api/ventas` - Gestión de ventas
- `GET/POST /api/alimentacion` - Gestión de raciones de alimento
- Y más...

## Uso

1. **Inicia la Aplicación**: Ejecuta `python app.py` en el directorio Backend
2. **Accede al Panel**: Abre http://localhost:5000
3. **Navega por las Secciones**: Usa la barra lateral para acceder a diferentes módulos
4. **Agrega Datos**: Usa los formularios "Agregar Nuevo" en cada sección
5. **Visualiza Datos**: Las listas muestran todos los registros con opciones de editar/eliminar
6. **Sube Archivos**: Los registros sanitarios soportan subida de certificados

## Contribución

1. Haz un fork del repositorio
2. Crea una rama de características
3. Realiza tus cambios
4. Prueba exhaustivamente
5. Envía una solicitud de pull

## Licencia

Este proyecto es parte de un trabajo de tesis. Por favor contacta al autor para permisos de uso.

## Autor

Juan Pablo - Proyecto de Tesis 2025
