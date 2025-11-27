// src/modules/schemes/schemes.routes.ts
import { Router } from "express";
import {
  listSchemesHandler,
  getSchemeByIdHandler,
  createSchemeHandler,
  updateSchemeHandler,
  deleteSchemeHandler,
  getSchemeSummaryHandler,
} from "./schemes.controller";

import { listSchemePointsBySchemeHandler } from "../schemePoints/schemePoints.controller";

const schemesRouter = Router();

// listar todos os esquemas
schemesRouter.get("/", listSchemesHandler);

// resumo (summary) de um esquema
schemesRouter.get("/:id/summary", getSchemeSummaryHandler);

// 🔹 NOVO: pontos de um esquema (rota que o front espera)
schemesRouter.get("/:id/points", listSchemePointsBySchemeHandler);

// buscar um esquema por id
schemesRouter.get("/:id", getSchemeByIdHandler);

// criar
schemesRouter.post("/", createSchemeHandler);

// atualizar
schemesRouter.put("/:id", updateSchemeHandler);

// deletar
schemesRouter.delete("/:id", deleteSchemeHandler);

export { schemesRouter };
