# La Vete · Sistema de control de vacantes y postulantes

Aplicación web para que RRHH de **La Vete** (cadena de clínicas veterinarias de Costa Rica) controle vacantes y postulantes (Veterinario y Auxiliar) por etapa, sin depender de correo y teléfono.

## Stack
React + TanStack Start + Tailwind CSS v4. Sin backend: los datos viven en `localStorage`. Sin llamadas de red (salvo la carga de fuentes Nunito e Inter).

## Cómo ejecutar
```sh
npm i
npm run dev
```
Pruebas de reglas: `bunx vitest run`.

## Perfiles
- **RRHH**: entra sin clave. Ve postulaciones y vacantes.
- **Administración**: clave **`vet2026`** (en `src/lib/vete.ts`, constante `ADMIN_CLAVE`). Todo lo de RRHH más el alta de vacantes.
- El perfil no se guarda: al recargar se vuelve a la pantalla inicial. Botón «Cambiar de perfil» en la cabecera.

## Sedes (7)
Curridabat, Escazú, San Pedro, Tibás, Heredia, Alajuela, Cartago.

## Reglas de etapas
Postuló → Entrevistado → Oferta enviada → Contratado / Rechazado. «Mover a la siguiente etapa» avanza una sola posición; desde «Oferta enviada» se elige «Contratado» o «Rechazado»; en esas dos no hay más movimientos. Se guarda la fecha de ingreso a cada etapa. Quien esté en «Entrevistado» más de 5 días muestra «Más de 5 días sin avanzar».

## Reglas de cupo (por sede + puesto)
- Plazas = suma de las vacantes de esa sede y puesto (las vacantes repetidas se suman).
- «Oferta enviada» y «Contratado» ocupan plaza; «Rechazado» la libera.
- No se puede mover a «Oferta enviada» si las plazas ocupadas igualan el total.
- No se permite el alta si no hay vacante o si todas las plazas están contratadas.
- Si todas están contratadas, quienes siguen en Postuló/Entrevistado muestran «Plazas cubiertas: avisar al postulante».
- El total de vacantes de la cadena (cabecera) es solo informativo.

## Datos de ejemplo
Se cargan solo si `localStorage` está vacío o corrupto: 18 postulantes en Curridabat, Escazú, San Pedro y Heredia, en todas las etapas, con fechas relativas al día actual. Incluye 3 en «Entrevistado» con más de 5 días, nombres con acento/guion (María-José Araya, Valeria Montero-Castro) y Escazú·Veterinario con todas sus plazas contratadas.

## localStorage
Clave: **`lavete-datos-v1`**. Para restablecer los datos: en la consola del navegador ejecute `localStorage.removeItem("lavete-datos-v1")` y recargue. Lecturas y escrituras están protegidas con try/catch y validación del JSON.

## Correo y WhatsApp (simulado)
Los botones «Enviar correo» y «Enviar WhatsApp» están **simulados en el código**: la función `sendMessage` en `src/lib/vete.ts` (comentario «SIMULADO: reemplazar por integración real») genera el mensaje y lo registra en el historial de la ficha. Reemplace esa función por la integración real; la interfaz no cambia.

## Cómo probar los criterios de aceptación
1. Abra un postulante en «Postuló», toque «Mover a la siguiente etapa»: el listado y los contadores cambian al instante.
2. Solo existe el botón de la etapa siguiente; desde «Oferta enviada» solo «Contratado» o «Rechazado» (también cubierto en `src/test/vete.test.ts`).
3. «Nuevo postulante» → «Guardar» vacío: aparecen errores junto a nombre, puesto y sede, y no se guarda.
4. Elija «Administración»: sin la clave `vet2026` no se muestra ningún postulante; clave incorrecta muestra error.
5. Haga cualquier cambio, recargue o cierre y abra la pestaña: el cambio sigue ahí.
6. Abra la vista móvil (360 px): sin scroll horizontal, botones de al menos 44 px, cabecera fija y formularios desplazables.
7. Sin imágenes, iconos SVG en línea, fuentes con `display=swap` y sin librerías extra.
8. Este README y la vista previa de Lovable funcionando.

## Próximos pasos
Kodarvia integrará backend, políticas de acceso y despliegue.
