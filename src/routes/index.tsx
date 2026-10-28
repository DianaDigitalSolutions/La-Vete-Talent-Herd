import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_CLAVE, ETAPAS, PUESTOS, SEDES, agregarVacante, avisarPostulante, cargar, conDemora, cubiertas, rechazarPorCupo, correoValido,
  disponibles, errorAlta, fmt, guardar, mover, normalizar, ocupadas, plazasDe, sendMessage, telValido, uid,
  type Datos, type Etapa, type Postulante, type Puesto, type Sede,
} from "@/lib/vete";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Vete · Sistema de control de vacantes y postulantes" },
      { name: "description", content: "Control de vacantes y postulantes de veterinarios y auxiliares de La Vete." },
      { property: "og:title", content: "La Vete · Control de vacantes y postulantes" },
      { property: "og:description", content: "Control de vacantes y postulantes de veterinarios y auxiliares de La Vete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Perfil = "rrhh" | "admin";
const btn = "min-h-11 rounded-xl px-4 font-semibold transition active:scale-[.98] disabled:opacity-50";
const bPri = `${btn} bg-vet text-blanco hover:bg-vet/90`;
const bSec = `${btn} border border-vet/30 bg-blanco text-vet hover:bg-vet/5`;
const aPri = `${btn} bg-[#6FAE7B] font-bold text-[#16303E] hover:bg-[#6FAE7B]/90 disabled:opacity-60`;
const aSec = `${btn} bg-[#1F5C7A] text-[#FFFFFF] hover:bg-[#1F5C7A]/90 disabled:opacity-60`;
const aInp = "min-h-11 w-full rounded-xl border border-[#1F5C7A] bg-[#F7FBFD] px-3 text-base text-[#16303E] placeholder:text-[#16303E]/75 focus:outline-none focus:ring-2 focus:ring-vet/40";
const card = "rounded-2xl border border-[#CFE3EC] bg-[#EAF3F7] text-[#16303E] shadow-md";
const inp = "min-h-11 w-full rounded-xl border border-tinta/20 bg-blanco px-3 text-base text-tinta focus:border-vet focus:outline-none focus:ring-2 focus:ring-vet/30";

const etapaCls: Record<Etapa, string> = {
  "Postuló": "border border-et2 bg-et1 text-tinta",
  "Entrevistado": "border border-vet bg-et2 text-tinta",
  "Oferta enviada": "border border-hoja bg-et3 text-tinta",
  "Contratado": "border border-hoja-oscuro bg-hoja text-tinta",
  "Rechazado": "border border-tinta bg-tinta text-blanco",
};

const Reloj = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const Pata = ({ c = "h-6 w-6" }: { c?: string }) => (
  <svg viewBox="0 0 24 24" className={c} fill="currentColor"><circle cx="6" cy="10" r="2.2" /><circle cx="10" cy="6" r="2.2" /><circle cx="14" cy="6" r="2.2" /><circle cx="18" cy="10" r="2.2" /><path d="M12 11c-3 0-6 4-6 6.5 0 1.5 1.3 2 2.5 2 1.4 0 2.3-.8 3.5-.8s2.1.8 3.5.8c1.2 0 2.5-.5 2.5-2C18 15 15 11 12 11z" /></svg>
);

function Demora() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#16303E] px-2 py-1 text-xs font-semibold text-[#FFFFFF]"><Reloj />Más de 5 días sin avanzar</span>;
}
function Cubiertas() {
  return <span className="inline-flex rounded-full bg-[#6FAE7B] px-2 py-1 text-xs font-semibold text-[#16303E]">Plazas cubiertas: avisar al postulante</span>;
}

function Index() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [tab, setTab] = useState<"post" | "vac">("post");
  const [toast, setToast] = useState("");

  useEffect(() => { setDatos(cargar()); }, []);
  const actualizar = (d: Datos) => { setDatos(d); guardar(d); };
  const avisar = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  if (!perfil) return <Bienvenida onEntrar={setPerfil} />;
  if (!datos) return null;
  const total = datos.vacantes.reduce((a, v) => a + v.plazas, 0);

  return (
    <div className="min-h-screen bg-[#1F5C7A] text-base leading-relaxed text-[#FFFFFF]" style={{ colorScheme: "light" }}>
      <header className="sticky top-0 z-20 bg-[#17475F] text-[#FFFFFF] shadow-md" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:flex-nowrap">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-extrabold leading-tight">La Vete</p>
            <p className="text-xs text-blanco"><span>{perfil === "admin" ? "Administración" : "RRHH"}</span><span className="hidden sm:inline"> · Total de vacantes: <b className="font-bold text-[#FFFFFF]">{total}</b></span></p>
          </div>
          <button className={`${btn} shrink-0 border border-[#FFFFFF] text-sm text-[#FFFFFF] hover:bg-[#FFFFFF]/10`} onClick={() => setPerfil(null)}>Cambiar de perfil</button>
          <p className="order-last w-full min-w-0 text-xs text-blanco sm:hidden">Total de vacantes: <b className="font-bold text-[#FFFFFF]">{total}</b></p>
        </div>
        <nav className="mx-auto flex max-w-5xl px-2">
          {([["post", "Postulaciones"], ["vac", "Vacantes"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`min-h-11 flex-1 border-b-4 font-display font-bold ${tab === k ? "border-[#6FAE7B] bg-[#FFFFFF] text-[#1F5C7A]" : "border-transparent text-[#FFFFFF]"}`}>{l}</button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
        {tab === "post" ? <Postulaciones datos={datos} actualizar={actualizar} avisar={avisar} /> : <Vacantes datos={datos} actualizar={actualizar} admin={perfil === "admin"} avisar={avisar} />}
      </main>
      {toast && <div role="status" className="fixed inset-x-4 z-50 mx-auto max-w-sm rounded-xl bg-tinta px-4 py-3 text-center font-semibold text-blanco shadow-lg" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>{toast}</div>}
    </div>
  );
}

function Bienvenida({ onEntrar }: { onEntrar: (p: Perfil) => void }) {
  const [admin, setAdmin] = useState(false);
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-vet to-tinta px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-blanco p-6 text-tinta shadow-xl">
        <div className="flex items-center gap-2 text-vet"><Pata c="h-8 w-8 text-hoja" /><span className="font-display text-3xl font-extrabold">La Vete</span></div>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight">Sistema de control de vacantes y postulantes</h1>
        {!admin ? (
          <div className="mt-6 grid gap-3">
            <button className={`${bPri} min-h-14 text-lg`} onClick={() => onEntrar("rrhh")}>RRHH</button>
            <button className={`${bSec} min-h-14 text-lg`} onClick={() => setAdmin(true)}>Administración</button>
          </div>
        ) : (
          <form className="mt-6 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (clave === ADMIN_CLAVE) onEntrar("admin"); else setErr("Clave incorrecta. Inténtelo de nuevo."); }}>
            <label className="text-sm font-semibold" htmlFor="clave">Ingrese la clave de Administración</label>
            <input id="clave" type="password" className={inp} value={clave} onChange={(e) => { setClave(e.target.value); setErr(""); }} autoFocus />
            {err && <p className="text-sm font-semibold text-tinta">⚠ {err}</p>}
            <button className={bPri}>Ingresar</button>
            <button type="button" className={bSec} onClick={() => { setAdmin(false); setClave(""); setErr(""); }}>Volver</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tinta/60 sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[100dvh] w-full max-w-lg flex-col rounded-t-3xl border border-[#CFE3EC] bg-[#EAF3F7] text-[#16303E] shadow-xl sm:max-h-[90dvh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-tinta/10 px-4 py-2">
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-bold">{titulo}</h2>
          <button aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-tinta/5" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>{children}</div>
      </div>
    </div>
  );
}

type Form = { nombre: string; puesto: string; sede: string; telefono: string; whatsapp: string; correo: string };
function validar(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (!f.nombre.trim()) e.nombre = "Ingrese el nombre.";
  if (!f.puesto) e.puesto = "Seleccione el puesto.";
  if (!f.sede) e.sede = "Seleccione la sede.";
  if (f.telefono && !telValido(f.telefono)) e.telefono = "Ingrese 8 dígitos (ej.: 8888-8888).";
  if (f.whatsapp && !telValido(f.whatsapp)) e.whatsapp = "Ingrese 8 dígitos (ej.: 8888-8888).";
  if (f.correo && !correoValido(f.correo)) e.correo = "Ingrese un correo válido.";
  return e;
}

function FormPostulante({ inicial, onGuardar, aviso }: { inicial: Form; onGuardar: (f: Form) => void; aviso?: string }) {
  const [f, setF] = useState(inicial);
  const [e, setE] = useState<Partial<Record<keyof Form, string>>>({});
  const campo = (k: keyof Form, label: string, el: ReactNode) => (
    <div><label className="mb-1 block text-sm font-semibold" htmlFor={k}>{label}</label>{el}{e[k] && <p className="mt-1 text-sm font-semibold text-vet">⚠ {e[k]}</p>}</div>
  );
  const set = (k: keyof Form) => (ev: { target: { value: string } }) => setF({ ...f, [k]: ev.target.value });
  return (
    <form noValidate className="grid gap-3" onSubmit={(ev) => { ev.preventDefault(); const er = validar(f); setE(er); if (!Object.keys(er).length) onGuardar(f); }}>
      {campo("nombre", "Nombre completo *", <input id="nombre" className={aInp} value={f.nombre} onChange={set("nombre")} />)}
      {campo("puesto", "Puesto *", <select id="puesto" className={aInp} value={f.puesto} onChange={set("puesto")}><option value="">Seleccione…</option>{PUESTOS.map((p) => <option key={p}>{p}</option>)}</select>)}
      {campo("sede", "Sede *", <select id="sede" className={aInp} value={f.sede} onChange={set("sede")}><option value="">Seleccione…</option>{SEDES.map((s) => <option key={s}>{s}</option>)}</select>)}
      {campo("telefono", "Teléfono", <input id="telefono" inputMode="tel" className={aInp} value={f.telefono} onChange={set("telefono")} placeholder="8888-8888" />)}
      {campo("whatsapp", "WhatsApp", <input id="whatsapp" inputMode="tel" className={aInp} value={f.whatsapp} onChange={set("whatsapp")} placeholder="8888-8888" />)}
      {campo("correo", "Correo", <input id="correo" type="email" className={aInp} value={f.correo} onChange={set("correo")} placeholder="nombre@correo.cr" />)}
      {aviso && <p role="alert" className="rounded-xl border border-vet bg-vet/10 p-3 text-sm font-semibold text-tinta">⚠ {aviso}</p>}
      <button className={aPri}>Guardar</button>
    </form>
  );
}

const telFmt = (t: string) => { const d = t.replace(/\D/g, ""); return d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4)}` : t; };

function Postulaciones({ datos, actualizar, avisar }: { datos: Datos; actualizar: (d: Datos) => void; avisar: (m: string) => void }) {
  const [q, setQ] = useState("");
  const [fSede, setFSede] = useState("");
  const [fEtapa, setFEtapa] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const [avisoAlta, setAvisoAlta] = useState("");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const now = Date.now();

  const lista = useMemo(() => {
    const nq = normalizar(q.trim());
    return datos.postulantes.filter((p) => (!nq || normalizar(p.nombre).includes(nq)) && (!fSede || p.sede === fSede) && (!fEtapa || p.etapa === fEtapa));
  }, [datos, q, fSede, fEtapa]);
  const ficha = datos.postulantes.find((p) => p.id === fichaId);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex-1 font-display text-2xl font-bold">Postulaciones</h1>
        <button className={aPri} onClick={() => { setAvisoAlta(""); setNuevo(true); }}>+ Nuevo postulante</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ETAPAS.map((e) => (
          <button key={e} onClick={() => setFEtapa(fEtapa === e ? "" : e)} className={`min-h-11 rounded-2xl border p-3 text-left ${fEtapa === e ? "border-[#1F5C7A] ring-2 ring-[#1F5C7A]/30" : "border-[#CFE3EC]"} ${cntCls[e]}`}>
            <p className="font-display text-2xl font-extrabold">{datos.postulantes.filter((p) => p.etapa === e).length}</p>
            <p className="text-sm">{e}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input className={aInp} placeholder="Buscar por nombre" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar por nombre" />
        <select className={aInp} value={fSede} onChange={(e) => setFSede(e.target.value)} aria-label="Filtrar por sede"><option value="">Todas las sedes</option>{SEDES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={aInp} value={fEtapa} onChange={(e) => setFEtapa(e.target.value)} aria-label="Filtrar por etapa"><option value="">Todas las etapas</option>{ETAPAS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {fSede && (
        <section className={`${card} p-3`}>
          <h2 className="mb-2 font-display font-bold">Plazas en {fSede}</h2>
          <div className="grid grid-cols-2 gap-2">
            {PUESTOS.map((p) => {
              const t = plazasDe(datos, fSede as Sede, p);
              return <div key={p} className="rounded-xl bg-blanco p-3 shadow-sm"><p className="text-sm font-semibold text-vet">{p}</p><p className="font-display text-lg font-bold">{t ? `${disponibles(datos, fSede as Sede, p)} disponibles de ${t}` : "Sin vacantes abiertas"}</p></div>;
            })}
          </div>
        </section>
      )}
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-blanco/50 p-8 text-center text-blanco">
          <Pata c="mx-auto mb-2 h-8 w-8 text-hoja" />No se encontraron postulantes con esos criterios. Pruebe con otro nombre o quite los filtros.
        </div>
      ) : (
        <ul className="grid gap-2">
          {lista.map((p) => (
            <li key={p.id}>
              <button onClick={() => setFichaId(p.id)} className="w-full rounded-2xl border border-[#CFE3EC] bg-[#EAF3F7] p-3 text-left text-[#16303E] shadow-md hover:border-[#1F5C7A]">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1"><p className="break-words font-display font-bold">{p.nombre}</p><p className="text-sm text-tinta/80">{p.puesto} · {p.sede}</p></div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${etapaCls[p.etapa]}`}>{p.etapa}</span>
                </div>
                {(conDemora(p, now) || avisarPostulante(datos, p)) && <div className="mt-2 flex flex-wrap gap-1">{conDemora(p, now) && <Demora />}{avisarPostulante(datos, p) && <Cubiertas />}</div>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {nuevo && (
        <Modal titulo="Nuevo postulante" onClose={() => setNuevo(false)}>
          <FormPostulante aviso={avisoAlta} inicial={{ nombre: "", puesto: "", sede: "", telefono: "", whatsapp: "", correo: "" }} onGuardar={(f) => {
            const err = errorAlta(datos, f.sede as Sede, f.puesto as Puesto);
            if (err) { setAvisoAlta(err + " No se guardó el postulante."); return; }
            const p: Postulante = { id: uid(), nombre: f.nombre.trim(), puesto: f.puesto as Puesto, sede: f.sede as Sede, telefono: f.telefono.trim(), whatsapp: f.whatsapp.trim(), correo: f.correo.trim(), etapa: "Postuló", fechas: { "Postuló": new Date().toISOString() }, notas: [], mensajes: [] };
            actualizar({ ...datos, postulantes: [p, ...datos.postulantes] });
            setNuevo(false); avisar("Postulante registrado");
          }} />
        </Modal>
      )}
      {ficha && <Ficha p={ficha} datos={datos} actualizar={actualizar} avisar={avisar} onClose={() => setFichaId(null)} />}
    </div>
  );
}

const cntCls: Record<Etapa, string> = { "Postuló": "bg-[#CFE3EC] text-[#16303E]", "Entrevistado": "bg-[#9FC4D6] text-[#16303E]", "Oferta enviada": "bg-[#CDE6D1] text-[#16303E]", "Contratado": "bg-[#6FAE7B] text-[#16303E]", "Rechazado": "bg-[#16303E] text-[#FFFFFF]" };

function Ficha({ p, datos, actualizar, avisar, onClose }: { p: Postulante; datos: Datos; actualizar: (d: Datos) => void; avisar: (m: string) => void; onClose: () => void }) {
  const [editar, setEditar] = useState(false);
  const [nota, setNota] = useState("");
  const [errMov, setErrMov] = useState("");
  const set = (np: Postulante) => actualizar({ ...datos, postulantes: datos.postulantes.map((x) => (x.id === p.id ? np : x)) });
  const mv = (e: Etapa) => { const r = mover(datos, p.id, e); if (r.error) setErrMov(r.error); else { setErrMov(""); actualizar(r.datos); avisar(`Movido a «${e}»`); } };
  const [enviando, setEnviando] = useState(false);
  const enviar = (c: "Correo" | "WhatsApp") => { if (enviando) return; setEnviando(true); setTimeout(() => setEnviando(false), 1000); const m = sendMessage(p, c); set({ ...p, mensajes: [m, ...p.mensajes] }); avisar("Enviado"); };
  const sig: Partial<Record<Etapa, Etapa>> = { "Postuló": "Entrevistado", "Entrevistado": "Oferta enviada" };
  const sec = "rounded-2xl border border-vet/20 bg-blanco p-3 shadow-sm";
  const cub = avisarPostulante(datos, p);
  const llenas = p.etapa === "Oferta enviada" && cubiertas(datos, p.sede, p.puesto);
  const rechazar = () => { const r = rechazarPorCupo(datos, p.id); if (r.error) setErrMov(r.error); else { setErrMov(""); actualizar(r.datos); avisar("Movido a «Rechazado»"); } };

  return (
    <Modal titulo={p.nombre} onClose={onClose}>
      {editar ? (
        <FormPostulante inicial={{ nombre: p.nombre, puesto: p.puesto, sede: p.sede, telefono: p.telefono, whatsapp: p.whatsapp, correo: p.correo }} onGuardar={(f) => {
          set({ ...p, nombre: f.nombre.trim(), puesto: f.puesto as Puesto, sede: f.sede as Sede, telefono: f.telefono.trim(), whatsapp: f.whatsapp.trim(), correo: f.correo.trim() });
          setEditar(false); avisar("Datos actualizados");
        }} />
      ) : (
        <div className="grid gap-3">
          <section className={sec}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="font-semibold">Puesto</dt><dd>{p.puesto}</dd>
              <dt className="font-semibold">Sede</dt><dd>{p.sede}</dd>
              <dt className="font-semibold">Teléfono</dt><dd>{p.telefono ? telFmt(p.telefono) : "No registrado"}</dd>
              <dt className="font-semibold">WhatsApp</dt><dd>{p.whatsapp ? telFmt(p.whatsapp) : "No registrado"}</dd>
              <dt className="font-semibold">Correo</dt><dd className="break-all">{p.correo || "No registrado"}</dd>
            </dl>
            <button className={`${aSec} mt-3 w-full`} onClick={() => setEditar(true)}>Editar datos</button>
          </section>
          <section className={sec}>
            <div className="flex flex-wrap items-center gap-2"><h3 className="flex-1 font-display font-bold">Etapa actual</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${etapaCls[p.etapa]}`}>{p.etapa}</span></div>
            <div className="mt-2 flex flex-wrap gap-1">{conDemora(p) && <Demora />}{avisarPostulante(datos, p) && <Cubiertas />}</div>
            <ol className="mt-2 grid gap-1 text-sm">{ETAPAS.filter((e) => p.fechas[e]).map((e) => <li key={e}>• {e}: {fmt(p.fechas[e])}</li>)}</ol>
            {errMov && <p role="alert" className="mt-2 rounded-xl border border-vet bg-vet/10 p-3 text-sm font-semibold">⚠ {errMov}</p>}
            <div className="mt-3 grid gap-2">
              {sig[p.etapa] && <button className={aPri} onClick={() => mv(sig[p.etapa]!)}>Mover a la siguiente etapa</button>}
              {p.etapa === "Oferta enviada" && <div className="grid grid-cols-2 gap-2"><button className={aPri} disabled={llenas} onClick={() => mv("Contratado")}>Contratado</button>{cub ? <button className={aSec} onClick={rechazar}>Rechazar: plazas cubiertas</button> : <button className={aSec} onClick={() => mv("Rechazado")}>Rechazado</button>}</div>}
              {llenas && <p role="alert" className="text-sm font-semibold">⚠ Todas las plazas de {p.puesto} en {p.sede} ya están contratadas. No se puede contratar.</p>}
              {sig[p.etapa] && cub && <button className={aSec} onClick={rechazar}>Rechazar: plazas cubiertas</button>}
              {(p.etapa === "Contratado" || p.etapa === "Rechazado") && <p className="text-sm text-tinta/70">Proceso finalizado: no hay más movimientos.</p>}
            </div>
          </section>
          {(p.correo || p.whatsapp) && (
            <section className={`${sec} grid grid-cols-2 gap-2`}>
              {p.correo && <button className={aSec} disabled={enviando} onClick={() => enviar("Correo")}>Enviar correo</button>}
              {p.whatsapp && <button className={aSec} disabled={enviando} onClick={() => enviar("WhatsApp")}>Enviar WhatsApp</button>}
            </section>
          )}
          <section className={sec}>
            <h3 className="font-display font-bold">Notas de entrevista</h3>
            <form className="mt-2 grid gap-2" onSubmit={(e) => { e.preventDefault(); if (!nota.trim()) return; set({ ...p, notas: [...p.notas, { fecha: new Date().toISOString(), texto: nota.trim() }] }); setNota(""); avisar("Nota agregada"); }}>
              <textarea className={`${aInp} min-h-20 py-2`} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Escriba la nota de la entrevista" aria-label="Nueva nota" />
              <button className={aPri} disabled={!nota.trim()}>Agregar nota</button>
            </form>
            <ul className="mt-3 grid gap-2">
              {[...p.notas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((n, i) => <li key={i} className="rounded-xl bg-vet/5 p-2 text-sm"><p className="text-xs font-bold text-vet">{fmt(n.fecha)}</p>{n.texto}</li>)}
              {!p.notas.length && <li className="text-sm text-tinta/80">Aún no hay notas registradas.</li>}
            </ul>
          </section>
          <section className={sec}>
            <h3 className="font-display font-bold">Historial de mensajes</h3>
            <ul className="mt-2 grid gap-2">
              {p.mensajes.map((m, i) => <li key={i} className="rounded-xl bg-hoja/10 p-2 text-sm"><p className="text-xs font-bold text-vet">{m.canal} · {fmt(m.fecha)} · Enviado</p>{m.texto}</li>)}
              {!p.mensajes.length && <li className="text-sm text-tinta/80">Aún no se han enviado mensajes.</li>}
            </ul>
          </section>
        </div>
      )}
    </Modal>
  );
}

function Vacantes({ datos, actualizar, admin, avisar }: { datos: Datos; actualizar: (d: Datos) => void; admin: boolean; avisar: (m: string) => void }) {
  const [f, setF] = useState({ sede: "", puesto: "", plazas: "1" });
  const [e, setE] = useState<Record<string, string>>({});
  const crear = () => {
    const er: Record<string, string> = {};
    if (!f.sede) er["sede"] = "Seleccione la sede.";
    if (!f.puesto) er["puesto"] = "Seleccione el puesto.";
    const n = Number(f.plazas);
    if (!Number.isInteger(n) || n < 1) er["plazas"] = "Ingrese un número entero mayor o igual a 1.";
    setE(er);
    if (Object.keys(er).length) return;
    actualizar(agregarVacante(datos, f.sede as Sede, f.puesto as Puesto, n));
    setF({ sede: "", puesto: "", plazas: "1" }); avisar("Vacante registrada");
  };
  const err = (k: string) => e[k] && <p className="mt-1 text-sm font-semibold text-vet">⚠ {e[k]}</p>;
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-2xl font-bold">Vacantes</h1>
      {admin && (
        <form noValidate className={`grid gap-3 ${card} p-3 sm:grid-cols-4 sm:items-start`} onSubmit={(ev) => { ev.preventDefault(); crear(); }}>
          <h2 className="font-display font-bold sm:col-span-4">Nueva vacante</h2>
          <div><select className={aInp} aria-label="Sede" value={f.sede} onChange={(ev) => setF({ ...f, sede: ev.target.value })}><option value="">Sede…</option>{SEDES.map((s) => <option key={s}>{s}</option>)}</select>{err("sede")}</div>
          <div><select className={aInp} aria-label="Puesto" value={f.puesto} onChange={(ev) => setF({ ...f, puesto: ev.target.value })}><option value="">Puesto…</option>{PUESTOS.map((s) => <option key={s}>{s}</option>)}</select>{err("puesto")}</div>
          <div><input className={aInp} aria-label="Cantidad de plazas" type="number" min={1} step={1} inputMode="numeric" value={f.plazas} onChange={(ev) => setF({ ...f, plazas: ev.target.value })} />{err("plazas")}</div>
          <button className={aPri}>Agregar vacante</button>
        </form>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {SEDES.map((s) => {
          const tot = PUESTOS.reduce((a, p) => a + plazasDe(datos, s, p), 0);
          const occ = PUESTOS.reduce((a, p) => a + Math.min(ocupadas(datos, s, p), plazasDe(datos, s, p)), 0);
          const estado = tot === 0 ? ["Sin vacantes", "border border-vet bg-et1 text-tinta"] : occ >= tot ? ["Completa", "bg-hoja text-tinta"] : ["Con plazas disponibles", "bg-[#CDE6D1] text-[#16303E]"];
          return (
            <section key={s} className="rounded-2xl border border-[#CFE3EC] bg-[#EAF3F7] p-4 text-[#16303E] shadow-[0_2px_8px_rgba(22,48,62,0.12)]">
              <div className="flex flex-wrap items-center gap-2"><h2 className="flex-1 font-display text-lg font-bold text-[#1F5C7A]">{s}</h2><span className={`rounded-full px-2 py-1 text-xs font-bold ${estado[1]}`}>{estado[0]}</span></div>
              {tot === 0 ? <p className="mt-2 text-sm text-[#16303E]">No hay vacantes abiertas en esta sede.</p> : PUESTOS.filter((p) => plazasDe(datos, s, p)).map((p) => {
                const t = plazasDe(datos, s, p), o = ocupadas(datos, s, p);
                return (
                  <div key={p} className="mt-3 rounded-xl bg-[#FFFFFF] p-3 text-[#16303E]">
                    <div className="flex items-center gap-2"><p className="flex-1 text-sm font-semibold text-[#16303E]">{p}</p><p className="text-sm font-bold text-[#16303E]">{o} de {t} plazas cubiertas</p></div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#CFE3EC]"><div className="h-full bg-[#6FAE7B]" style={{ width: `${Math.min(100, (o / t) * 100)}%` }} /></div>
                    <div className="mt-2 flex flex-wrap gap-1">{ETAPAS.map((e) => <span key={e} className={`rounded-full px-2 py-1 text-sm ${cntCls[e]}`}>{e}: <b>{datos.postulantes.filter((x) => x.sede === s && x.puesto === p && x.etapa === e).length}</b></span>)}</div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
