// src/modules/schemePoints/schemePoints.controller.ts
import type { Request, Response } from "express";
import {
  getAllSchemePoints,
  getSchemePointById,
  getSchemePointsBySchemeId,
  createSchemePoint,
  updateSchemePoint,
  deleteSchemePoint,
} from "./schemePoints.service";
import type {
  CreateSchemePointInput,
  UpdateSchemePointInput,
} from "./schemePoints.types";

import { supabase } from "../../config/upabaseClient";

/**
 * GET /scheme-points
 */
export async function listSchemePointsHandler(_req: Request, res: Response) {
  try {
    const points = await getAllSchemePoints();
    return res.json(points);
  } catch (err) {
    console.error("[listSchemePointsHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao listar pontos de esquema operacional" });
  }
}

/**
 * GET /scheme-points/:id
 */
export async function getSchemePointByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const point = await getSchemePointById(id);

    if (!point) {
      return res
        .status(404)
        .json({ message: "Ponto de esquema operacional não encontrado" });
    }

    return res.json(point);
  } catch (err) {
    console.error("[getSchemePointByIdHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao buscar ponto de esquema operacional" });
  }
}

/**
 * GET /schemes/:schemeId/points  👈 rota aninhada
 */
export async function listSchemePointsBySchemeHandler(
  req: Request,
  res: Response
) {
  try {
    const { schemeId } = req.params;
    const points = await getSchemePointsBySchemeId(schemeId);
    return res.json(points);
  } catch (err) {
    console.error("[listSchemePointsBySchemeHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao listar pontos do esquema operacional" });
  }
}

/**
 * POST /scheme-points
 */
export async function createSchemePointHandler(req: Request, res: Response) {
  try {
    const body = req.body as CreateSchemePointInput;

    if (
      !body.scheme_id ||
      !body.location_id ||
      typeof body.ordem !== "number" ||
      !body.tipo ||
      typeof body.distancia_km !== "number" ||
      typeof body.tempo_deslocamento_min !== "number" ||
      typeof body.tempo_no_local_min !== "number"
    ) {
      return res
        .status(400)
        .json({ message: "Dados obrigatórios não informados" });
    }

    const point = await createSchemePoint(body);
    return res.status(201).json(point);
  } catch (err) {
    console.error("[createSchemePointHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao criar ponto de esquema operacional" });
  }
}

/**
 * PUT /scheme-points/:id
 */
export async function updateSchemePointHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = req.body as UpdateSchemePointInput;

    const updated = await updateSchemePoint(id, body);
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Ponto de esquema operacional não encontrado" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[updateSchemePointHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao atualizar ponto de esquema operacional" });
  }
}

/**
 * DELETE /scheme-points/:id
 */
export async function deleteSchemePointHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteSchemePoint(id);
    return res.status(204).send();
  } catch (err) {
    console.error("[deleteSchemePointHandler]", err);
    return res
      .status(500)
      .json({ message: "Erro ao excluir ponto de esquema operacional" });
  }
}

// 🔎 listar pontos de um esquema específico (rota correta usada no front)
export async function listPointsBySchemeIdHandler(req: Request, res: Response) {
  const { id: schemeId } = req.params;

  try {
    const { data, error } = await supabase
      .from("scheme_points")
      .select(
        `
        id,
        scheme_id,
        ordem,
        tipo,
        distancia_km,
        tempo_deslocamento_min,
        tempo_no_local_min,
        location:locations (
          id,
          sigla,
          descricao,
          cidade,
          uf,
          tipo,
          lat,
          lng
        )
      `
      )
      .eq("scheme_id", schemeId)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("[listPointsBySchemeIdHandler] erro:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar pontos do esquema" });
    }

    if (!data || data.length === 0) {
      // 404 para o hook tratar como "nenhum ponto"
      return res.status(404).json({ message: "Nenhum ponto encontrado" });
    }

    return res.json(data);
  } catch (err) {
    console.error("[listPointsBySchemeIdHandler] exceção:", err);
    return res.status(500).json({ message: "Erro interno ao buscar pontos" });
  }
}
