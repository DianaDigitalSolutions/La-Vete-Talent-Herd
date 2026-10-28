# La Vete · Sistema de control de vacantes y postulantes

Herramienta interna de Recursos Humanos y Administración de **La Vete** (cadena de clínicas veterinarias de Costa Rica) para controlar vacantes y postulantes (Veterinario y Auxiliar) por etapa, sin depender de correo y teléfono.

## Stack
React + TanStack Start + Tailwind CSS v4. Sin backend: los datos viven en `localStorage`. Sin llamadas de red (salvo la carga de fuentes Nunito e Inter).

## Cómo ejecutar
```sh
npm i
npm run dev
```
Pruebas de reglas: `bunx vitest run`.

## Clave de administración
**`vet2026`** (en `src/lib/vete.ts`, constante `ADMIN_CLAVE`).

## Perfiles
- **RRHH**: entra sin clave. Ve postulaciones y vacantes.
- **Administración**: pide la clave antes de mostrar cualquier postulante. Todo lo de RRHH más el alta de vacantes (una a la vez).
- El perfil no se guarda: al recargar se vuelve a la pantalla inicial. Botón «Cambiar de perfil» en la cabecera.

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
Los botones «Enviar correo» y «Enviar WhatsApp» de la ficha están **simulados en el código**: la función `sendMessage` en `src/lib/vete.ts` (comentario «SIMULADO: reemplazar por integración real») genera el mensaje y lo registra en el historial de la ficha. Los envíos ocurren únicamente al pulsar el botón, una entrada por pulsación; nada más genera envíos. Para la integración real, reemplace esa función; la interfaz no cambia.

## Datos de ejemplo
Se cargan solo si `localStorage` está vacío o corrupto: 19 postulantes en Curridabat, Escazú, San Pedro y Heredia, en todas las etapas, con fechas relativas al día actual. Incluye 3 en «Entrevistado» con más de 5 días, nombres con acento/guion (María-José Araya, Valeria Montero-Castro) y Escazú·Veterinario con todas sus plazas contratadas y una oferta enviada.

## localStorage
Clave: **`lavete-datos-v1`**. Para restablecer los datos: en la consola del navegador ejecute `localStorage.removeItem("lavete-datos-v1")` y recargue. Lecturas y escrituras están protegidas con try/catch y validación del JSON; si el dato está corrupto, la app reinicia con los datos de ejemplo.

## Cómo probar los criterios de aceptación
1. Abra un postulante en «Postuló», toque «Mover a la siguiente etapa»: el listado, los contadores y las vacantes cambian al instante.
2. Solo existe el botón de la etapa siguiente; desde «Oferta enviada» solo «Contratado» o «Rechazado» (también cubierto en `src/test/vete.test.ts`).
3. «Nuevo postulante» → «Guardar» vacío: aparecen errores junto a nombre, puesto y sede, y no se guarda.
4. Elija «Administración»: sin la clave `vet2026` no se muestra ningún postulante; clave incorrecta muestra error.
5. Haga cualquier cambio, recargue o cierre y abra la pestaña: el cambio sigue ahí.
6. Abra la vista móvil (360 px): sin scroll horizontal, botones de al menos 44 px, cabecera fija con el «Total de vacantes» completo y formularios desplazables.
7. Sin imágenes, iconos SVG en línea, fuentes con `display=swap` y sin librerías extra.
8. Este README y la vista previa de Lovable funcionando.

## Notas
- Los datos se guardan en cada dispositivo y navegador (localStorage). Lo que se carga en un dispositivo no aparece en otro; la sincronización entre dispositivos y usuarios requiere el backend que integrará Kodarvia.
- La app usa la paleta azul veterinario en modo claro.

## Próximos pasos
Kodarvia integrará backend, políticas de acceso y despliegue.
