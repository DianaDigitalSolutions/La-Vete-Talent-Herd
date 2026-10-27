import { describe, expect, it } from "vitest";
import { agregarVacante, errorAlta, mover, normalizar, seed } from "@/lib/vete";

describe("Reglas La Vete", () => {
  const d = seed();
  it("no permite saltear etapas", () => {
    const p = d.postulantes.find((x) => x.etapa === "Postuló")!;
    expect(mover(d, p.id, "Oferta enviada").error).toBeTruthy();
    expect(mover(d, p.id, "Entrevistado").datos.postulantes.find((x) => x.id === p.id)!.etapa).toBe("Entrevistado");
  });
  it("bloquea oferta sin plazas (San Pedro Auxiliar 1 plaza ya con oferta)", () => {
    const d2 = { ...d, postulantes: [...d.postulantes, { ...d.postulantes[0], id: "x", sede: "San Pedro" as const, puesto: "Auxiliar" as const, etapa: "Entrevistado" as const }] };
    expect(mover(d2, "x", "Oferta enviada").error).toBeTruthy();
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
