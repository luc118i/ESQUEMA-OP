// src/modules/schemePoints/schemePoints.routes.ts

import { Router } from "express";
import {
  listSchemePointsHandler,
  getSchemePointByIdHandler,
  createSchemePointHandler,
  updateSchemePointHandler,
  deleteSchemePointHandler,
  listPointsBySchemeIdHandler,
  replaceSchemePointsHandler,
} from "./schemePoints.controller";

const schemePointsRouter = Router();

/**
 * ROTAS ORGANIZADAS
 * ------------------
 * /scheme-points                    -> lista todos
 * /scheme-points/schemes/:id/points -> lista por esquema
 * /scheme-points/:id                -> CRUD individual
 * /scheme-points/schemes/:id/points -> substituir lista completa
 */

/* -----------------------------
   🔎 1) LISTAR TODOS OS PONTOS
------------------------------*/
schemePointsRouter.get("/", listSchemePointsHandler);

/* ---------------------------------------------------------
   🔎 2) LISTAR PONTOS DE UM ESQUEMA (USADO PELO FRONT)
   GET /scheme-points/schemes/:schemeId/points
----------------------------------------------------------*/
schemePointsRouter.get(
  "/schemes/:schemeId/points",
  listPointsBySchemeIdHandler
);

/* --------------------------------------------------------
   💾 3) SUBSTITUIR TODA A LISTA DE PONTOS DE UM ESQUEMA
   PUT /scheme-points/schemes/:schemeId/points
---------------------------------------------------------*/
schemePointsRouter.put("/schemes/:schemeId/points", replaceSchemePointsHandler);

/* -----------------------------
   🔎 4) BUSCAR 1 PONTO POR ID
------------------------------*/
schemePointsRouter.get("/:id", getSchemePointByIdHandler);

/* -----------------------------
   ➕ 5) CRIAR INDIVIDUAL
------------------------------*/
schemePointsRouter.post("/", createSchemePointHandler);

/* -----------------------------
   ✏ 6) ATUALIZAR INDIVIDUAL
------------------------------*/
schemePointsRouter.put("/:id", updateSchemePointHandler);

/* -----------------------------
   🗑 7) EXCLUIR INDIVIDUAL
------------------------------*/
schemePointsRouter.delete("/:id", deleteSchemePointHandler);

export { schemePointsRouter };
