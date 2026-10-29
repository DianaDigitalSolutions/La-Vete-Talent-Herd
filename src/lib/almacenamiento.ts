import { useEffect, useState } from "react";

export const EVENTO_ALMACENAMIENTO = "lavete-almacenamiento";

/** Solo en el cliente. Prueba acceso, escritura, lectura y borrado. */
export function almacenamientoDisponible(): boolean {
  try {
    const ls = window.localStorage;
    const k = "lavete-prueba";
    ls.setItem(k, "1");
    const ok = ls.getItem(k) === "1";
    ls.removeItem(k);
    return ok;
  } catch {
    return false;
  }
}

/** Avisa a la franja el resultado de una escritura real. */
export function notificarAlmacenamiento(ok: boolean) {
  try { window.dispatchEvent(new CustomEvent(EVENTO_ALMACENAMIENTO, { detail: ok })); } catch { /* sin window */ }
}

export function useAlmacenamientoBloqueado() {
  const [bloqueado, setBloqueado] = useState(false);
  useEffect(() => {
    const revisar = () => setBloqueado(!almacenamientoDisponible());
    const alEscribir = (e: Event) => setBloqueado((e as CustomEvent<boolean>).detail ? !almacenamientoDisponible() : true);
    revisar();
    window.addEventListener(EVENTO_ALMACENAMIENTO, alEscribir);
    window.addEventListener("focus", revisar);
    document.addEventListener("visibilitychange", revisar);
    const t = setInterval(revisar, 10000);
    return () => {
      window.removeEventListener(EVENTO_ALMACENAMIENTO, alEscribir);
      window.removeEventListener("focus", revisar);
      document.removeEventListener("visibilitychange", revisar);
      clearInterval(t);
    };
  }, []);
  return bloqueado;
}
