// src/hooks/useSaveScheme.ts

import { useState, useCallback } from "react";
import { saveScheme, type SchemeDraft } from "@/services/schemes/saveScheme";

interface UseSaveSchemeResult {
  isSaving: boolean;
  error: string | null;
  save: (draft: SchemeDraft) => Promise<{ schemeId: string } | null>;
}

export function useSaveScheme(): UseSaveSchemeResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (draft: SchemeDraft) => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveScheme(draft);
      return result;
    } catch (err: any) {
      const message =
        err?.message || "Erro inesperado ao salvar esquema operacional.";
      console.error("[useSaveScheme] erro:", err);
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { isSaving, error, save };
}
