import { useEffect, useState } from "react";
import type { OperationalScheme } from "@/types/scheme";
import { mapToOperationalScheme } from "@/lib/mapToOperationalScheme";

export function useSchemes() {
  const [data, setData] = useState<OperationalScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:3333/schemes");
        if (!res.ok) throw new Error("Erro ao buscar esquemas operacionais");

        const json = await res.json(); // ← SchemeWithLocations[]

        const mapped = (json as any[]).map((schemeRow) =>
          mapToOperationalScheme(
            schemeRow,
            [], // sem pontos na listagem
            {
              // resumo mínimo baseado no próprio esquema
              totalKm: Number(schemeRow.distancia_total_km ?? 0),
            }
          )
        );

        setData(mapped);
      } catch (err: any) {
        console.error("[useSchemes] erro:", err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
