// src/hooks/useScheme.ts
import { useEffect, useState } from "react";
import type { OperationalScheme } from "@/types/scheme";
import { mapToOperationalScheme } from "@/lib/mapToOperationalScheme";

export function useScheme(id: string) {
  const [data, setData] = useState<OperationalScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const apiBase = "http://localhost:3333";

        const schemeUrl = `${apiBase}/schemes/${id}`;
        const pointsUrl = `${apiBase}/scheme-points/schemes/${id}/points`;
        const summaryUrl = `${apiBase}/schemes/${id}/summary`;

        console.log("[useScheme] schemeUrl:", schemeUrl);
        console.log("[useScheme] pointsUrl:", pointsUrl);
        console.log("[useScheme] summaryUrl:", summaryUrl);

        // busca tudo em paralelo
        const [schemeRes, pointsRes, summaryRes] = await Promise.all([
          fetch(schemeUrl),
          fetch(pointsUrl),
          fetch(summaryUrl),
        ]);

        if (!schemeRes.ok) {
          throw new Error("Erro ao carregar esquema");
        }
        const schemeJson = await schemeRes.json();
        console.log("[useScheme] schemeJson:", schemeJson);

        // pontos: se 404, usa []
        let pointsJson: any[] = [];
        if (pointsRes.status === 404) {
          console.warn(
            "[useScheme] /scheme-points/scheme/:id retornou 404, usando []"
          );
        } else if (!pointsRes.ok) {
          throw new Error("Erro ao carregar pontos");
        } else {
          pointsJson = await pointsRes.json();
        }
        console.log("[useScheme] pointsJson:", pointsJson);

        if (!summaryRes.ok) {
          throw new Error("Erro ao carregar resumo");
        }
        const summaryJson = await summaryRes.json();
        console.log("[useScheme] summaryJson:", summaryJson);

        const mapped = mapToOperationalScheme(
          schemeJson,
          pointsJson,
          summaryJson
        );

        setData(mapped);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  return { data, loading, error };
}
