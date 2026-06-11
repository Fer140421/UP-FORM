# Plan de Corrección de Estilos y Tematización de Angular Material

Este plan aborda los problemas de visualización en el proyecto UP-FORM, incluyendo botones sin color, elementos de formulario (selects) transparentes, menús del header invisibles y placeholders demasiado marcados.

## Diagnóstico
El problema principal parece ser la falta de una importación explícita del tema de Angular Material en los estilos globales (`styles.css`). En versiones modernas de Angular Material (v15+), se requiere un tema para inicializar las variables CSS de los componentes MDC. Al no existir un tema, muchos componentes pierden sus colores base, fondos y estados visuales, lo que resulta en la transparencia y falta de color reportada.

## Cambios Propuestos

### 1. Configuración del Tema Global (`src/styles.css`)
- Importar un tema pre-construido de Angular Material como base (ej. `indigo-pink`).
- Asegurar que las variables de color primario personalizadas se apliquen correctamente a través de las variables CSS de MDC.
- Corregir las sobreescrituras que causan transparencia.

### 2. Corrección de Botones
- Asegurar que los botones `mat-flat-button`, `mat-raised-button` y `mat-icon-button` tengan definidos tanto el color de fondo como el color de texto.
- Refinar las clases de utilidad como `.btn-success` y `.btn-danger`.

### 3. Corrección de Selects y Elementos de Formulario
- Asegurar que los paneles de `mat-select` y otros elementos desplegables tengan un fondo sólido (`var(--surface-color)`).
- Ajustar la opacidad y el color de los placeholders para que se vean como tales y no como texto real.

### 4. Corrección del Header y Menús
- Aplicar un fondo sólido y sombra a los menús desplegables (`mat-menu`).
- Ajustar el estilo del botón de perfil en el toolbar para que sea visible y consistente.

## Pasos de Implementación

1. **Modificar `src/styles.css`**:
   - Añadir `@import "@angular/material/prebuilt-themes/azure-blue.css";` (o similar).
   - Ajustar el bloque `:root` para incluir variables de Material si es necesario.
   - Refinar las reglas de `mat-mdc-form-field` y `mat-mdc-select`.
   - Ajustar el selector de placeholder global.

2. **Revisar `src/app/features/dashboard/main-layout/main-layout.component.css`**:
   - Asegurar que el toolbar y sus elementos tengan colores de contraste correctos.

3. **Verificación**:
   - Verificar la visibilidad de los botones en la lista de instituciones.
   - Verificar que el select de "Género" en el wizard sea legible.
   - Verificar que el menú de usuario en el header tenga fondo.

## Verificación y Pruebas
- Inspeccionar visualmente cada componente afectado.
- Asegurar que no haya errores de consola relacionados con CSS.
- Validar que los estados `:hover` y `:active` funcionen correctamente.
