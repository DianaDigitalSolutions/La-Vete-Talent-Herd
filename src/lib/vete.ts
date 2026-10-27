export const SEDES = ["Curridabat", "Escazú", "San Pedro", "Tibás", "Heredia", "Alajuela", "Cartago"] as const;
export const PUESTOS = ["Veterinario", "Auxiliar"] as const;
export const ETAPAS = ["Postuló", "Entrevistado", "Oferta enviada", "Contratado", "Rechazado"] as const;
export type Sede = (typeof SEDES)[number];
export type Puesto = (typeof PUESTOS)[number];
export type Etapa = (typeof ETAPAS)[number];

export interface Vacante { id: string; sede: Sede; puesto: Puesto; plazas: number }
export interface Nota { fecha: string; texto: string }
export interface Mensaje { fecha: string; canal: "Correo" | "WhatsApp"; texto: string }
export interface Postulante {
  id: string; nombre: string; puesto: Puesto; sede: Sede;
  telefono: string; whatsapp: string; correo: string;
  etapa: Etapa; fechas: Partial<Record<Etapa, string>>;
  notas: Nota[]; mensajes: Mensaje[];
}
export interface Datos { vacantes: Vacante[]; postulantes: Postulante[] }

export const STORAGE_KEY = "lavete-datos-v1";
export const ADMIN_CLAVE = "vet2026";
const DIA = 86400000;

export const uid = () => Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
export const fmt = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
export const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/-/g, "");
export const telValido = (t: string) => /^[245678]\d{7}$/.test(t.replace(/[\s-]/g, ""));
export const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim());

export const plazasDe = (d: Datos, sede: Sede, puesto: Puesto) =>
  d.vacantes.filter((v) => v.sede === sede && v.puesto === puesto).reduce((a, v) => a + v.plazas, 0);
const contar = (d: Datos, sede: Sede, puesto: Puesto, etapas: Etapa[]) =>
  d.postulantes.filter((p) => p.sede === sede && p.puesto === puesto && etapas.includes(p.etapa)).length;
export const ocupadas = (d: Datos, s: Sede, p: Puesto) => contar(d, s, p, ["Oferta enviada", "Contratado"]);
export const disponibles = (d: Datos, s: Sede, p: Puesto) => Math.max(0, plazasDe(d, s, p) - ocupadas(d, s, p));
export const cubiertas = (d: Datos, s: Sede, p: Puesto) => {
  const t = plazasDe(d, s, p);
  return t > 0 && contar(d, s, p, ["Contratado"]) >= t;
};
export const avisarPostulante = (d: Datos, p: Postulante) =>
  (p.etapa === "Postuló" || p.etapa === "Entrevistado") && cubiertas(d, p.sede, p.puesto);
export const conDemora = (p: Postulante, now = Date.now()) =>
  p.etapa === "Entrevistado" && !!p.fechas.Entrevistado && now - new Date(p.fechas.Entrevistado).getTime() > 5 * DIA;

/** Devuelve un mensaje de error o null si el alta está permitida. */
export function errorAlta(d: Datos, sede: Sede, puesto: Puesto): string | null {
  const t = plazasDe(d, sede, puesto);
  if (t === 0) return `No hay vacantes abiertas de ${puesto} en ${sede}.`;
  if (cubiertas(d, sede, puesto)) return `Todas las plazas de ${puesto} en ${sede} ya están contratadas.`;
  return null;
}

/** Mueve un postulante. Solo permite la etapa inmediatamente siguiente. */
export function mover(d: Datos, id: string, destino: Etapa): { datos: Datos; error?: string } {
  const p = d.postulantes.find((x) => x.id === id);
  if (!p) return { datos: d, error: "Postulante no encontrado." };
  const permitidos: Record<Etapa, Etapa[]> = {
    "Postuló": ["Entrevistado"], "Entrevistado": ["Oferta enviada"],
    "Oferta enviada": ["Contratado", "Rechazado"], "Contratado": [], "Rechazado": [],
  };
  if (!permitidos[p.etapa].includes(destino)) return { datos: d, error: "No se pueden saltear etapas." };
  if (destino === "Oferta enviada" && ocupadas(d, p.sede, p.puesto) >= plazasDe(d, p.sede, p.puesto))
    return { datos: d, error: `No quedan plazas disponibles de ${p.puesto} en ${p.sede}. No se puede enviar la oferta.` };
  const np = { ...p, etapa: destino, fechas: { ...p.fechas, [destino]: new Date().toISOString() } };
  return { datos: { ...d, postulantes: d.postulantes.map((x) => (x.id === id ? np : x)) } };
}

export function agregarVacante(d: Datos, sede: Sede, puesto: Puesto, plazas: number): Datos {
  const ex = d.vacantes.find((v) => v.sede === sede && v.puesto === puesto);
  if (ex) return { ...d, vacantes: d.vacantes.map((v) => (v === ex ? { ...v, plazas: v.plazas + plazas } : v)) };
  return { ...d, vacantes: [...d.vacantes, { id: uid(), sede, puesto, plazas }] };
}

/** SIMULADO: reemplazar por integración real de correo / WhatsApp. No realiza ninguna llamada de red. */
export function sendMessage(p: Postulante, canal: "Correo" | "WhatsApp"): Mensaje {
  const texto = `Estimado(a) ${p.nombre}: le contactamos de La Vete en relación con su postulación al puesto de ${p.puesto} en la sede ${p.sede}. Su etapa actual es «${p.etapa}».`;
  return { fecha: new Date().toISOString(), canal, texto };
}

export function seed(now = Date.now()): Datos {
  const back = (n: number) => new Date(now - n * DIA).toISOString();
  const orden: Etapa[] = ["Postuló", "Entrevistado", "Oferta enviada"];
  let i = 0;
  const mk = (nombre: string, puesto: Puesto, sede: Sede, etapa: Etapa, dias: number, tel = "", notas: string[] = []): Postulante => {
    const camino = etapa === "Contratado" || etapa === "Rechazado" ? [...orden, etapa] : orden.slice(0, orden.indexOf(etapa) + 1);
    const fechas: Partial<Record<Etapa, string>> = {};
    camino.forEach((e, k) => (fechas[e] = back(dias + (camino.length - 1 - k) * 4)));
    i++;
    return {
      id: "p" + i, nombre, puesto, sede, telefono: tel, whatsapp: tel,
      correo: tel ? normalizar(nombre.split(" ")[0]) + "." + i + "@correo.cr" : "",
      etapa, fechas, notas: notas.map((t, k) => ({ texto: t, fecha: back(dias + k) })), mensajes: [],
    };
  };
  return {
    vacantes: [
      { id: "v1", sede: "Curridabat", puesto: "Veterinario", plazas: 2 },
      { id: "v2", sede: "Curridabat", puesto: "Auxiliar", plazas: 2 },
      { id: "v3", sede: "Escazú", puesto: "Veterinario", plazas: 1 },
      { id: "v4", sede: "Escazú", puesto: "Auxiliar", plazas: 2 },
      { id: "v5", sede: "San Pedro", puesto: "Veterinario", plazas: 2 },
      { id: "v6", sede: "San Pedro", puesto: "Auxiliar", plazas: 1 },
      { id: "v7", sede: "Heredia", puesto: "Veterinario", plazas: 1 },
      { id: "v8", sede: "Heredia", puesto: "Auxiliar", plazas: 2 },
    ],
    postulantes: [
      mk("Ana María Solís Vargas", "Veterinario", "Curridabat", "Entrevistado", 8, "88451230", ["Experiencia de 6 años en medicina interna de pequeñas especies.", "Disponibilidad para turnos nocturnos del hospital 24 horas."]),
      mk("José Pablo Jiménez Mora", "Veterinario", "Curridabat", "Oferta enviada", 2, "87214455", ["Buen manejo de cirugía de tejidos blandos."]),
      mk("Daniela Quesada Rojas", "Veterinario", "Curridabat", "Postuló", 1, "70123344"),
      mk("María-José Araya Mora", "Auxiliar", "Curridabat", "Entrevistado", 7, "61234567", ["Trato muy amable con propietarios y mascotas."]),
      mk("Kevin Rojas Salazar", "Auxiliar", "Curridabat", "Contratado", 3, "83335566"),
      mk("Fabiola Chaves Núñez", "Auxiliar", "Curridabat", "Rechazado", 2),
      mk("Andrés Calderón Ureña", "Veterinario", "Escazú", "Contratado", 5, "88990011", ["Especialidad en imagenología."]),
      mk("Sofía Brenes Arias", "Veterinario", "Escazú", "Postuló", 2, "72224488"),
      mk("Esteban Víquez Campos", "Veterinario", "Escazú", "Entrevistado", 2, "", ["Recién graduado, muy buena disposición."]),
      mk("Valeria Montero-Castro", "Auxiliar", "Escazú", "Postuló", 0, "64447788"),
      mk("Luis Diego Alfaro Segura", "Auxiliar", "Escazú", "Oferta enviada", 1, "85556677"),
      mk("Mariana Céspedes León", "Veterinario", "San Pedro", "Entrevistado", 1, "86667788", ["Interés en medicina de animales exóticos."]),
      mk("Jorge Arguedas Pérez", "Veterinario", "San Pedro", "Rechazado", 4),
      mk("Carolina Zúñiga Ramírez", "Auxiliar", "San Pedro", "Oferta enviada", 3, "89991122"),
      mk("Gabriel Méndez Porras", "Veterinario", "Heredia", "Postuló", 1, "71118899"),
      mk("Natalia Sánchez Herrera", "Veterinario", "Heredia", "Entrevistado", 6, "84443322", ["Buena entrevista técnica; pendiente referencia laboral."]),
      mk("Ricardo Elizondo Mata", "Auxiliar", "Heredia", "Contratado", 6, "60001122"),
      mk("Priscilla Hidalgo Soto", "Auxiliar", "Heredia", "Postuló", 0, "87776655"),
    ],
  };
}

const esValido = (d: unknown): d is Datos => {
  const x = d as Datos;
  return !!x && Array.isArray(x.vacantes) && Array.isArray(x.postulantes) &&
    x.vacantes.every((v) => SEDES.includes(v?.sede) && PUESTOS.includes(v?.puesto) && Number.isInteger(v?.plazas) && v.plazas >= 1) &&
    x.postulantes.every((p) => typeof p?.nombre === "string" && SEDES.includes(p.sede) && PUESTOS.includes(p.puesto) &&
      ETAPAS.includes(p.etapa) && !!p.fechas && Array.isArray(p.notas) && Array.isArray(p.mensajes));
};

export function cargar(): Datos {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); if (esValido(d)) return d; }
  } catch { /* corrupto o no disponible */ }
  const s = seed();
  guardar(s);
  return s;
}
export function guardar(d: Datos) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* sin almacenamiento: la app sigue en memoria */ }
}
