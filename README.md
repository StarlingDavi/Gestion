# Campus Tasks – Sistema de Gestión de Tareas

## Descripción
Este proyecto corresponde a una **versión alternativa** de un Sistema de Gestión de Tareas Académicas, desarrollada con **HTML, CSS y JavaScript**, manteniendo las mismas funcionalidades requeridas (CRUD completo), pero con un **diseño visual distinto** al prototipo original.

La aplicación utiliza un **tablero organizado por estados**, visualiza las tareas mediante **tarjetas**, y emplea un **JSON interno** junto con **localStorage** para asegurar la persistencia de los datos entre sesiones.

---

## Tecnologías utilizadas
- HTML5  
- CSS3  
- JavaScript (ES6)  
- localStorage  

---

## Estructura del proyecto
campus-tasks/
│
├── index.html
├── css/
│ └── styles.css
├── js/
│ └── app.js
└── README.md

yaml
Copiar código

---

## Estructura del JSON
Las tareas se almacenan como un arreglo de objetos en localStorage.

### Ejemplo de una tarea:
```json
{
  "id": 1700000000001,
  "dueDate": "2025-06-24",
  "time": "09:00",
  "subject": "Auditoría",
  "category": "Lectura",
  "priority": "Media",
  "status": "Completed Task",
  "title": "Lectura NIC/NIIF",
  "description": "Revisar los puntos clave de la norma para discusión en clase",
  "progress": 10
}
```
### Descripción de los campos
id: identificador único de la tarea

dueDate: fecha de entrega

time: hora estimada

subject: materia o área académica

category: etiqueta de clasificación visual

priority: nivel de prioridad (Alta, Media, Baja)

status: estado de la tarea (In Progress, Completed Task, Over-Due)

title: título de la tarea

description: descripción detallada

progress: nivel de avance de la tarea (0–10)

### Cómo ejecutar el proyecto localmente
Descargar o clonar el repositorio.

Abrir el archivo index.html directamente en el navegador.

### Cómo ejecutar el proyecto en GitHub Pages
Subir el proyecto a un repositorio en GitHub.

Ir a Settings → Pages.

Seleccionar la rama main y la carpeta raíz.

Guardar los cambios.

Acceder al enlace generado por GitHub Pages.

### Funcionalidades principales
Creación de nuevas tareas

Visualización en tarjetas organizadas por estado

Edición de tareas mediante ventana modal

Eliminación de tareas con confirmación

Filtros por prioridad y búsqueda por texto

Ordenamiento por fecha y prioridad

Persistencia de datos con localStorage

Diseño responsive para diferentes tamaños de pantalla
