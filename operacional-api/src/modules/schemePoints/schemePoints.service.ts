// src/modules/schemePoints/schemePoints.service.ts
import { supabase } from "../../config/upabaseClient";
import type {
  SchemePoint,
  CreateSchemePointInput,
  UpdateSchemePointInput,
} from "./schemePoints.types";

export async function getAllSchemePoints(): Promise<SchemePoint[]> {
  const { data, error } = await supabase
    .from("scheme_points")
    .select("*")
    .order("scheme_id", { ascending: true })
    .order("ordem", { ascending: true });

  if (error) {
    console.error("[getAllSchemePoints] erro:", error);
    throw new Error("Erro ao buscar pontos de esquema operacional");
  }

  return (data ?? []) as SchemePoint[];
}

export async function getSchemePointById(
  id: string
): Promise<SchemePoint | null> {
  const { data, error } = await supabase
    .from("scheme_points")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") {
      return null;
    }
    console.error("[getSchemePointById] erro:", error);
    throw new Error("Erro ao buscar ponto de esquema operacional");
  }

  return data as SchemePoint;
}

export async function getSchemePointsBySchemeId(
  schemeId: string
): Promise<SchemePoint[]> {
  const { data, error } = await supabase
    .from("scheme_points")
    .select("*")
    .eq("scheme_id", schemeId)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("[getSchemePointsBySchemeId] erro:", error);
    throw new Error("Erro ao buscar pontos do esquema operacional");
  }

  return (data ?? []) as SchemePoint[];
}

export async function createSchemePoint(
  input: CreateSchemePointInput
): Promise<SchemePoint> {
  const { data, error } = await supabase
    .from("scheme_points")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    console.error("[createSchemePoint] erro:", error);
    throw new Error("Erro ao criar ponto de esquema operacional");
  }

  return data as SchemePoint;
}

export async function updateSchemePoint(
  id: string,
  input: UpdateSchemePointInput
): Promise<SchemePoint | null> {
  const { data, error } = await supabase
    .from("scheme_points")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") {
      return null;
    }
    console.error("[updateSchemePoint] erro:", error);
    throw new Error("Erro ao atualizar ponto de esquema operacional");
  }

  return data as SchemePoint;
}

export async function deleteSchemePoint(id: string): Promise<boolean> {
  const { error } = await supabase.from("scheme_points").delete().eq("id", id);

  if (error) {
    console.error("[deleteSchemePoint] erro:", error);
    throw new Error("Erro ao excluir ponto de esquema operacional");
  }

  return true;
}
