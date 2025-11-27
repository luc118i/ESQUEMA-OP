// src/modules/schemePoints/schemePoints.routes.ts

import { Router } from "express";
import {
  listSchemePointsHandler,
  getSchemePointByIdHandler,
  createSchemePointHandler,
  updateSchemePointHandler,
  deleteSchemePointHandler,
  listPointsBySchemeIdHandler,
} from "./schemePoints.controller";

const schemePointsRouter = Router();

// 🔎 listar todos os pontos
schemePointsRouter.get("/", listSchemePointsHandler);

// 🔎 listar pontos de um esquema (ROTA CORRETA DO FRONT)
schemePointsRouter.get("/schemes/:id/points", listPointsBySchemeIdHandler);

// 🔎 buscar um ponto por id
schemePointsRouter.get("/:id", getSchemePointByIdHandler);

// ➕ criar
schemePointsRouter.post("/", createSchemePointHandler);

// ✏ atualizar
schemePointsRouter.put("/:id", updateSchemePointHandler);

// 🗑 excluir
schemePointsRouter.delete("/:id", deleteSchemePointHandler);

export { schemePointsRouter };
