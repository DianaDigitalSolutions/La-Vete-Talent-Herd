# La Vete · Sistema de control de vacantes y postulantes

Herramienta interna de Recursos Humanos y Administración de **La Vete** (cadena de clínicas veterinarias de Costa Rica) para controlar vacantes y postulantes (Veterinario y Auxiliar) por etapa, sin depender de correo y teléfono.

## Rutas
`/` es la página informativa pública: descripción del negocio, cómo llegar a cada sede (enlace a Google Maps) y redes sociales. No muestra postulantes ni vacantes. `/admin` es el panel de administración: pide perfil y clave antes de mostrar cualquier postulante o vacante.

## Stack
React + TanStack Start + Tailwind CSS v4. Sin backend: los datos viven en `localStorage`. Sin llamadas de red (salvo la carga de fuentes Nunito e Inter).

## Cómo ejecutar
```sh
npm i
npm run dev
```
Pruebas de reglas: `bunx vitest run`.

## Estructura del proyecto
- `src/routes/index.tsx`: página informativa pública (`/`).
- `src/datos/negocio.ts`: datos de ejemplo de la página informativa.
- `src/routes/admin.tsx`: todas las pantallas del panel (bienvenida, Postulaciones, Vacantes, fichas, formularios y ventanas emergentes).
- `src/lib/vete.ts`: reglas, sedes, puestos, etapas, clave, datos de ejemplo, localStorage y envío simulado (`sendMessage`).
- `src/routes/__root.tsx`: estructura base de la página y carga de fuentes.
- `src/styles.css`: paleta de colores y tipografías.
- `src/test/`: pruebas automáticas de las reglas.

## Clave de administración
**`vet2026`** (en `src/lib/vete.ts`, constante `ADMIN_CLAVE`).

## Perfiles
- El ingreso es en `/admin`: primero se elige el perfil y luego, si corresponde, su clave.
- **RRHH**: entra sin clave. Ve postulaciones y vacantes.
- **Administración**: pide la clave antes de mostrar cualquier postulante. Todo lo de RRHH más el alta de vacantes (una a la vez).
- El perfil y la clave no se guardan en el navegador: se piden al abrir y al recargar `/admin`; los datos sí se conservan. Botón «Cambiar de perfil» en la cabecera.

## Sedes (7)
Curridabat, Escazú, San Pedro, Tibás, Heredia, Alajuela, Cartago.

## Etapas
Postuló → Entrevistado → Oferta enviada → Contratado / Rechazado. «Mover a la siguiente etapa» avanza una sola posición; desde «Oferta enviada» se elige «Contratado» o «Rechazado»; en esas dos no hay más movimientos. Se guarda la fecha de ingreso a cada etapa.

Opción manual «Rechazar: plazas cubiertas»: solo la tiene quien muestra «Plazas cubiertas: avisar al postulante». Lo pasa directo a «Rechazado» y agrega la nota con fecha «Rechazado: plazas de la sede ya cubiertas». Una persona debe pulsarla; la app nunca rechaza por sí sola. Ese postulante conserva su botón para avanzar.

## Indicador de demora
Quien esté en «Entrevistado» más de 5 días muestra «Más de 5 días sin avanzar».

## Regla de cupo (por sede + puesto)
- Plazas = suma de las vacantes de esa sede y puesto (las vacantes repetidas se suman).
- Solo «Contratado» ocupa plaza; «Oferta enviada» y «Rechazado» no. Disponibles = plazas − contratados (mínimo 0).
- Enviar ofertas nunca se bloquea por cupo. Solo se bloquea pasar a «Contratado», con aviso, si los contratados igualan las plazas.
- No se permite el alta de postulante si no hay vacante o si todas las plazas están contratadas.
- Si todas están contratadas, quienes siguen en Postuló/Entrevistado/Oferta enviada muestran «Plazas cubiertas: avisar al postulante».
- El total de vacantes de la cadena (cabecera) es solo informativo.

## Correo y WhatsApp (simulado)
Los botones «Enviar correo» y «Enviar WhatsApp» de la ficha (visibles solo si el dato existe) abren la ventana **«Redactar mensaje»**: destinatario de solo lectura, «Asunto» editable (solo correo) y un cuadro de texto libre con un texto sugerido que puede borrarse o cambiarse. Nada se registra hasta pulsar **«Enviar»** (deshabilitado si el texto está vacío y durante un segundo tras pulsar): entonces se guarda en el historial de la ficha con la fecha y el texto tal como quedó, y aparece el aviso «Enviado». «Cancelar», la «×» o tocar fuera cierran sin registrar nada. Abrir fichas, recargar, mover de etapa, contratar o rechazar no generan mensajes.
Los envíos están **simulados en el código**: la función `sendMessage` en `src/lib/vete.ts` (comentario «SIMULADO: reemplazar por integración real») es el punto donde Kodarvia conectará la integración real. No hay pagos ni otras integraciones.

## Qué está simulado
La información de la página informativa (descripción, enlaces de Google Maps y redes sociales) es de ejemplo y se edita en `src/datos/negocio.ts`.

## Datos de ejemplo
Se cargan solo si `localStorage` está vacío o corrupto: 19 postulantes en Curridabat, Escazú, San Pedro y Heredia, en todas las etapas, con fechas relativas al día actual. Incluye 3 en «Entrevistado» con más de 5 días, nombres con acento/guion (María-José Araya, Valeria Montero-Castro) y Escazú·Veterinario con todas sus plazas contratadas y una oferta enviada.

## localStorage
Clave: **`lavete-datos-v1`**. Para restablecer los datos: en la consola del navegador ejecute `localStorage.removeItem("lavete-datos-v1")` y recargue. Lecturas y escrituras están protegidas con try/catch y validación del JSON; si el dato está corrupto, la app reinicia con los datos de ejemplo.

## Si el navegador bloquea localStorage
Si el navegador tiene bloqueado el almacenamiento local, se muestra una franja de aviso en `/` y en `/admin`. La aplicación sigue funcionando en memoria con los datos de ejemplo, pero los cambios no se conservan al recargar.

## Cómo probar los criterios de aceptación
1. Abra un postulante en «Postuló», toque «Mover a la siguiente etapa»: el listado, los contadores y las vacantes cambian al instante.
2. Solo existe el botón de la etapa siguiente; desde «Oferta enviada» solo «Contratado» o «Rechazado» (también cubierto en `src/test/vete.test.ts`).
3. «Nuevo postulante» → «Guardar» vacío: aparecen errores junto a nombre, puesto y sede, y no se guarda.
4. En `/admin`, elija «Administración»: sin la clave `vet2026` no se muestra ningún postulante; clave incorrecta muestra error.
5. Haga cualquier cambio, recargue o cierre y abra la pestaña: el cambio sigue ahí.
6. Abra la vista móvil (360 px): sin scroll horizontal, botones de al menos 44 px, cabecera fija con el «Total de vacantes» completo y formularios desplazables.
7. Sin imágenes, iconos SVG en línea, fuentes con `display=swap` y sin librerías extra.
8. Este README y la vista previa de Lovable funcionando.

## Decisiones de diseño
- Rutas: `/` es pública e informativa y `/admin` concentra toda la gestión, detrás de una clave.

## Notas
- Los datos se guardan en cada dispositivo y navegador (localStorage). Lo que se carga en un dispositivo no aparece en otro; la sincronización entre dispositivos y usuarios requiere el backend que integrará Kodarvia.
- La app usa siempre modo claro (`color-scheme: light`, sin modo oscuro) con la paleta azul veterinario.
- Kodarvia integrará el backend, las políticas y el despliegue.
