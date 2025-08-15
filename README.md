# FrontEnd

## 🚀 Stack Tecnológico

Este proyecto utiliza el siguiente conjunto de tecnologías:

- **React 18** – Biblioteca principal para construir la interfaz de usuario con componentes reutilizables
- **Redux Toolkit** – Gestión de estado global de la aplicación con patrones modernos
<<<<<<< HEAD
- **Material-UI (MUI) ** – Biblioteca de componentes de diseño siguiendo Material Design
- **Vite** – Herramienta de construcción y desarrollo ultrarrápida
- **React Router ** – Enrutamiento declarativo para aplicaciones de una sola página
=======
- **Material-UI (MUI)** – Biblioteca de componentes de diseño siguiendo Material Design
- **Vite** – Herramienta de construcción y desarrollo ultrarrápida
- **React Router** – Enrutamiento declarativo para aplicaciones de una sola página
>>>>>>> 08c0582 (Template commit)
- **JavaScript ES6+** – Lenguaje principal con características modernas


## 🧱 Arquitectura del Proyecto

Este proyecto implementa una arquitectura basada en capas, siguiendo patrones de desarrollo frontend modernos. La estructura está organizada con responsabilidades bien definidas:

```
src/
├── components/          # Componentes reutilizables UI
├── pages/              # Páginas principales de la aplicación  
├── redux/              # Gestión de estado global (slices, DTOs)
├── services/           # Servicios para comunicación con APIs
├── hooks/              # Hooks personalizados para lógica reutilizable
├── utilidades/         # Funciones auxiliares y configuraciones
└── tags/               # Componentes específicos de etiquetado
```

### 📁 Descripción de Capas

**Components**: Contiene componentes de UI reutilizables como cards, modals, barras de búsqueda. 

<<<<<<< HEAD
**Pages**: Implementa las páginas principales del sistema (Reportes, Clientes, Remitos, etc.), coordinando componentes y conectando con el estado global.
=======
**Pages**: Implementa las páginas principales del sistema, coordinando componentes y conectando con el estado global.
>>>>>>> 08c0582 (Template commit)

**Redux**: Gestiona el estado de la aplicación utilizando Redux Toolkit, incluyendo slices por dominio.

**Services**: Abstrae la comunicación con el backend, implementando las llamadas a APIs y transformaciones de datos.

**Hooks**: Proporciona lógica reutilizable encapsulada en hooks personalizados, facilitando el uso de operaciones complejas.


## 🧩 Patrones y Prácticas Implementadas

- **Component Composition**: Componentes altamente reutilizables y configurables
- **Redux Toolkit**: Gestión de estado predecible con reducers y actions organizados
- **Responsive Design**: Interfaz adaptable a diferentes dispositivos y pantallas
- **Separación de responsabilidades**: Cada módulo tiene una responsabilidad específica

## 🛠️ Tecnologías Utilizadas

### 📦 Gestión de Estado
La gestión de estado está implementada con **Redux Toolkit**, proporcionando:
- Store centralizado y predecible
- Slices organizados por dominio (clientes, reportes, remitos, etc.)
- Actions síncronos y asíncronos con createAsyncThunk
- Selectores optimizados para acceso a datos

### 🎨 Interfaz de Usuario
Se utiliza **Material-UI ** como biblioteca principal de componentes, ofreciendo:
- Componentes siguiendo Material Design
- Sistema de temas personalizable
- Componentes responsivos out-of-the-box
- Iconos consistentes con Material Icons

### 🔗 Comunicación con API
Los servicios de API están implementados con:
- Fetch API nativo para llamadas HTTP
- Transformación automática de datos con DTOs
- Manejo robusto de errores
- Configuración centralizada de endpoints


## 📚 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`
Inicia la aplicación en modo desarrollo.\
Abre [http://localhost:5001](http://localhost:5001) para verla en el navegador.



## 🚦 Configuración de Desarrollo

### Prerequisitos
- Node.js 18.0.0 
- npm 9.0.0 

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/DesApp-2025c1-Grupo-8/FrontEnd.git

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## 📦 Paquetes Principales

- **@reduxjs/toolkit** (^2.6.1) - Gestión de estado moderna
- **react** (^19.0.0) - Biblioteca de UI
- **react-redux** (^9.2.0) - Conectores de React con Redux
- **@mui/material** (^7.0.0) - Componentes de Material-UI
- **@mui/icons-material** (^7.0.0) - Iconos de Material Design
- **react-router-dom** (^7.4.0) - Enrutamiento
- **vite** (^6.2.3) - Herramienta de desarrollo y construcción

## 🎨 Estructura de Componentes


### Páginas Principales
<<<<<<< HEAD
- **Reports**: Gestión y generación de reportes
- **Clients**: Administración de clientes
- **Remitos**: Gestión de remitos y documentación
- **Destinos**: Gestion de destinos
- **Varios**: Control de mercadería y estados
=======
- **name**: desc
>>>>>>> 08c0582 (Template commit)
