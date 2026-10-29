import { useAlmacenamientoBloqueado } from "@/lib/almacenamiento";

export function FranjaAlmacenamiento() {
  const bloqueado = useAlmacenamientoBloqueado();
  if (!bloqueado) return null;
  return (
    <div role="alert" className="border-b-2 border-[#E5A3A3] bg-[#FDECEC] px-4 py-3 text-sm font-semibold text-[#9B2C2C]" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
      Su navegador tiene bloqueado el almacenamiento local. La aplicación funciona, pero los cambios no se conservarán al recargar la página ni al cerrar la pestaña. Habilite el almacenamiento del sitio o use otro navegador.
    </div>
  );
}
