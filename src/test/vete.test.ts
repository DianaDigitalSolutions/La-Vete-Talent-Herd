import { describe, expect, it } from "vitest";
import { agregarVacante, avisarPostulante, disponibles, errorAlta, ocupadas, rechazarPorCupo, mover, normalizar, seed } from "@/lib/vete";

describe("Reglas La Vete", () => {
  const d = seed();
  it("no permite saltear etapas", () => {
    const p = d.postulantes.find((x) => x.etapa === "Postuló")!;
    expect(mover(d, p.id, "Oferta enviada").error).toBeTruthy();
    expect(mover(d, p.id, "Entrevistado").datos.postulantes.find((x) => x.id === p.id)!.etapa).toBe("Entrevistado");
  });
  it("permite oferta aunque haya más ofertas que plazas (San Pedro Auxiliar)", () => {
    const d2 = { ...d, postulantes: [...d.postulantes, { ...d.postulantes[0]!, id: "x", sede: "San Pedro" as const, puesto: "Auxiliar" as const, etapa: "Entrevistado" as const }] };
    expect(mover(d2, "x", "Oferta enviada").error).toBeUndefined();
  });
  it("bloquea Contratado cuando las plazas ya están contratadas (Escazú Veterinario)", () => {
    const p = d.postulantes.find((x) => x.sede === "Escazú" && x.puesto === "Veterinario" && x.etapa === "Oferta enviada")!;
    expect(mover(d, p.id, "Contratado").error).toBeTruthy();
  });
  it("solo Contratado ocupa plaza", () => {
    expect(ocupadas(d, "Curridabat", "Veterinario")).toBe(0);
    expect(disponibles(d, "Curridabat", "Veterinario")).toBe(2);
  });
  it("rechazo por plazas cubiertas solo con la etiqueta, y agrega nota", () => {
    const p = d.postulantes.find((x) => x.sede === "Escazú" && x.puesto === "Veterinario" && x.etapa === "Postuló")!;
    expect(avisarPostulante(d, p)).toBe(true);
    const r = rechazarPorCupo(d, p.id).datos.postulantes.find((x) => x.id === p.id)!;
    expect(r.etapa).toBe("Rechazado");
    expect(r.notas.at(-1)!.texto).toBe("Rechazado: plazas de la sede ya cubiertas");
    expect(rechazarPorCupo(d, "p3").error).toBeTruthy();
  });
  it("alta: rechaza sin vacante o con todo contratado, permite con oferta pendiente", () => {
    expect(errorAlta(d, "Tibás", "Veterinario")).toBeTruthy();
    expect(errorAlta(d, "Escazú", "Veterinario")).toBeTruthy();
    expect(errorAlta(d, "San Pedro", "Auxiliar")).toBeNull();
  });
  it("suma plazas en la misma sede y puesto", () => {
    const d2 = agregarVacante(d, "Escazú", "Veterinario", 2);
    expect(d2.vacantes.filter((v) => v.sede === "Escazú" && v.puesto === "Veterinario")).toHaveLength(1);
    expect(d2.vacantes.find((v) => v.sede === "Escazú" && v.puesto === "Veterinario")!.plazas).toBe(3);
  });
  it("buscador ignora acentos, mayúsculas y guiones", () => {
    expect(normalizar("María-José")).toBe(normalizar("mariajose"));
  });
});
