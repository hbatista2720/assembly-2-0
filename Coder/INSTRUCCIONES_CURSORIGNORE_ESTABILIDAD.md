# Instrucción Coder: Crear .cursorignore para estabilidad de Cursor

**Origen:** Contralor (revisión tras crash de Cursor)  
**Fecha:** Febrero 2026  
**Objetivo:** Reducir la carga de indexación del editor para mejorar estabilidad.

---

## Tarea

Crear el archivo **`.cursorignore`** en la raíz del proyecto con el siguiente contenido:

```
# Reduce carga de Cursor - excluir carpetas pesadas de la indexación
node_modules/
.next/
.npm-cache/
out/
build/

# Cache y temporales
*.log
.DS_Store
```

---

## Justificación

- **Sin .cursorignore**, Cursor indexa todo el proyecto, incluyendo `node_modules/`, `.next/`, `.npm-cache/` (≈500MB). Esto aumenta el uso de memoria y puede contribuir a crashes.
- Excluir estas carpetas reduce la carga de indexación y mejora la estabilidad del editor.
- Tras crear el archivo, el usuario debe reiniciar Cursor para que aplique los cambios.

---

## Verificación

1. El archivo `.cursorignore` existe en la raíz del proyecto.
2. Contiene las líneas indicadas.
3. Informar al Contralor al finalizar.
