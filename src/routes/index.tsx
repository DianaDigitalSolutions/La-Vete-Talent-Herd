import { createFileRoute, Link } from "@tanstack/react-router";
import { FranjaAlmacenamiento } from "@/components/FranjaAlmacenamiento";
import { NEGOCIO, SEDES_INFO, mapaDe } from "@/datos/negocio";
import { SEDES } from "@/lib/vete";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Vete · Hospital veterinario 24 horas en Costa Rica" },
      { name: "description", content: "La Vete: atención veterinaria 24 horas desde hace más de 40 años. Conozca sus 7 sedes en Costa Rica y cómo llegar." },
      { property: "og:title", content: "La Vete · Hospital veterinario 24 horas" },
      { property: "og:description", content: "Atención veterinaria 24 horas desde hace más de 40 años, en 7 sedes de Costa Rica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inicio,
});

const boton = "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl px-4 font-semibold";
const externo = { target: "_blank", rel: "noopener noreferrer" } as const;

function Inicio() {
  const redes = [
    { nombre: "Facebook", url: NEGOCIO.facebook },
    { nombre: "Instagram", url: NEGOCIO.instagram },
  ].filter((r) => r.url);
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F8FA] text-base leading-relaxed text-[#16303E]" style={{ colorScheme: "light" }}>
      <FranjaAlmacenamiento />
      <header className="bg-[#1F5C7A] px-4 py-4 text-[#FFFFFF]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold">{NEGOCIO.nombre}</h1>
            <p className="text-sm text-[#FFFFFF]">{NEGOCIO.frase}</p>
          </div>
          <Link to="/admin" className={`${boton} border border-[#FFFFFF] bg-[#1F5C7A] text-[#FFFFFF] hover:bg-[#17475F]`}>Acceso administración</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5">
        <section>
          <h2 className="font-display text-xl font-bold text-[#1F5C7A]">Quiénes somos</h2>
          <p className="mt-1">{NEGOCIO.quienesSomos}</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-[#1F5C7A]">Cómo llegar</h2>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-[#CFE3EC] bg-[#FFFFFF] shadow-sm md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:border-0 md:bg-transparent md:shadow-none lg:grid-cols-4">
            {SEDES.map((s) => (
              <li key={s} className="flex min-h-16 items-center justify-between gap-3 border-b border-l-4 border-[#E3EEF3] border-l-[#6FAE7B] px-3 py-2 last:border-b-0 md:rounded-xl md:border md:border-l-4 md:border-[#CFE3EC] md:border-l-[#6FAE7B] md:bg-[#FFFFFF] md:shadow-sm md:last:border-b">
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-[#1F5C7A]">{s}</h3>
                  <p className="break-words text-xs text-[#4A5A63]">{SEDES_INFO[s]?.direccion}</p>
                </div>
                <a href={mapaDe(s)} {...externo} className={`${boton} bg-[#1F5C7A] text-sm text-[#FFFFFF] hover:bg-[#17475F]`}>Cómo llegar</a>
              </li>
            ))}
          </ul>
        </section>
        {redes.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-[#1F5C7A]">Síganos</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {redes.map((r) => (
                <a key={r.nombre} href={r.url} {...externo} className={`${boton} bg-[#6FAE7B] text-sm text-[#16303E] hover:bg-[#5E9C6A]`}>{r.nombre}</a>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="border-t border-[#CFE3EC] px-4 py-4 text-center text-sm" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <Link to="/admin" className="inline-flex min-h-11 items-center text-[#1F5C7A] underline">Acceso administración</Link>
      </footer>
    </div>
  );
}
