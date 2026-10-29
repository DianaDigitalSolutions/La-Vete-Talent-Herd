// Contenido de ejemplo de la página informativa. Edítelo aquí.
export const NEGOCIO = {
  nombre: "La Vete",
  frase: "Atención veterinaria 24 horas, desde hace más de 40 años",
  descripcion: [
    "La Vete es una cadena veterinaria costarricense con más de 40 años de trayectoria cuidando la salud de las mascotas de las familias del país.",
    "Trabajamos con un modelo de hospital veterinario 24 horas: nuestras sedes atienden de día y de noche, para que su mascota reciba atención cuando la necesite.",
    "En nuestras 7 sedes, un equipo profesional le brinda un trato cercano y respetuoso, y acompaña a cada familia en el cuidado de sus animales.",
  ],
  sedes: ["Curridabat", "Escazú", "Heredia", "Alajuela", "Cartago", "San Pedro", "Liberia"],
  redes: [
    { nombre: "Facebook", url: "https://www.facebook.com/" },
    { nombre: "Instagram", url: "https://www.instagram.com/" },
  ],
} as const;

export const mapaDe = (sede: string) =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("La Vete " + sede + " Costa Rica");
