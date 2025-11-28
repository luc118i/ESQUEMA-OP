import { useEffect, useState } from "react";
import type { OperationalScheme, SchemeListItem } from "@/types/scheme";
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

        const json = (await res.json()) as SchemeListItem[];

        const mapped = json.map(({ scheme, summary }) =>
          mapToOperationalScheme(scheme, [], summary)
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
