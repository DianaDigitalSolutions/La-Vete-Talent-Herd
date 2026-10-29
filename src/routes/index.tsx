import { createFileRoute, Link } from "@tanstack/react-router";
import { FranjaAlmacenamiento } from "@/components/FranjaAlmacenamiento";
import { NEGOCIO, mapaDe } from "@/datos/negocio";

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

const boton = "inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-semibold";
const externo = { target: "_blank", rel: "noopener noreferrer" } as const;

function Inicio() {
  return (
    <div className="min-h-screen bg-[#F4F8FA] text-base leading-relaxed text-[#16303E]" style={{ colorScheme: "light" }}>
      <FranjaAlmacenamiento />
      <header className="bg-[#1F5C7A] px-4 py-10 text-center text-[#FFFFFF]">
        <h1 className="font-display text-4xl font-bold">{NEGOCIO.nombre}</h1>
        <p className="mx-auto mt-2 max-w-md text-[#FFFFFF]">{NEGOCIO.frase}</p>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#6FAE7B]" />
      </header>
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <section>
          <h2 className="font-display text-2xl font-bold text-[#1F5C7A]">Quiénes somos</h2>
          {NEGOCIO.descripcion.map((t) => <p key={t} className="mt-3">{t}</p>)}
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold text-[#1F5C7A]">Cómo llegar</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {NEGOCIO.sedes.map((s) => (
              <li key={s} className="rounded-2xl border border-[#CFE3EC] bg-[#FFFFFF] p-4 shadow-sm">
                <h3 className="font-display text-lg font-bold">{s}</h3>
                <p className="text-sm text-[#4A5A63]">Hospital veterinario 24 horas</p>
                <a href={mapaDe(s)} {...externo} className={`${boton} mt-3 w-full bg-[#1F5C7A] text-[#FFFFFF] hover:bg-[#17475F]`}>Cómo llegar</a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold text-[#1F5C7A]">Síganos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {NEGOCIO.redes.map((r) => (
              <a key={r.nombre} href={r.url} {...externo} className={`${boton} bg-[#6FAE7B] text-[#16303E] hover:bg-[#5E9C6A]`}>{r.nombre}</a>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-[#CFE3EC] px-4 py-6 text-center text-sm" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <Link to="/admin" className="inline-flex min-h-11 items-center text-[#4A5A63] underline">Acceso administración</Link>
      </footer>
    </div>
  );
}
