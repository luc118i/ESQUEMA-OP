// src/modules/schemes/schemes.routes.ts
import { Router } from "express";
import {
  listSchemesHandler,
  getSchemeByIdHandler,
  createSchemeHandler,
  updateSchemeHandler,
  deleteSchemeHandler,
  getSchemeSummaryHandler,
  getSchemeFullHandler,
  searchSchemeByKeyHandler,
} from "./schemes.controller";

import { listPointsBySchemeIdHandler } from "../schemePoints/schemePoints.controller";

const schemesRouter = Router();

// lista todos
schemesRouter.get("/", listSchemesHandler);

// 🔍 buscar por (codigo + direction + tripTime)
schemesRouter.get("/search", searchSchemeByKeyHandler);

// full deve vir antes de "/:id"
schemesRouter.get("/:id/full", getSchemeFullHandler);

schemesRouter.get("/:id/summary", getSchemeSummaryHandler);
schemesRouter.get("/:id/points", listPointsBySchemeIdHandler);
schemesRouter.get("/:id", getSchemeByIdHandler);

schemesRouter.post("/", createSchemeHandler);
schemesRouter.put("/:id", updateSchemeHandler);
schemesRouter.delete("/:id", deleteSchemeHandler);

export { schemesRouter };
