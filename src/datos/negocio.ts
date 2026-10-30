// Contenido de ejemplo de la página informativa. Edítelo aquí.
import { SEDES } from "@/lib/vete";

const PROVINCIA: Record<string, string> = {
  Curridabat: "San José", "Escazú": "San José", "Tibás": "San José", "San Pedro": "San José",
  Heredia: "Heredia", Alajuela: "Alajuela", Cartago: "Cartago", Liberia: "Guanacaste",
};

// Direcciones de ejemplo a nivel de distrito. Reemplazar direccion por la dirección real y completar enlaceMapas con el enlace de Google Maps de la sede.
export const SEDES_INFO: Record<string, { direccion: string; enlaceMapas: string }> = Object.fromEntries(
  SEDES.map((s) => [s, { direccion: PROVINCIA[s] ? `${s}, ${PROVINCIA[s]}, Costa Rica` : `${s}, Costa Rica`, enlaceMapas: "" }]),
);

export const NEGOCIO = {
  nombre: "La Vete",
  frase: "Atención veterinaria 24 horas, desde hace más de 40 años",
  quienesSomos: "Más de 40 años cuidando a las mascotas de Costa Rica. Siete hospitales veterinarios abiertos las 24 horas, con un equipo profesional y cercano.",
  // Reemplazar por los perfiles reales de La Vete.
  facebook: "https://www.facebook.com/",
  // Reemplazar por los perfiles reales de La Vete.
  instagram: "https://www.instagram.com/",
};

export const mapaDe = (sede: string) => {
  const info = SEDES_INFO[sede] ?? { direccion: `${sede}, Costa Rica`, enlaceMapas: "" };
  return info.enlaceMapas.startsWith("https://")
    ? info.enlaceMapas
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(info.direccion);
};
