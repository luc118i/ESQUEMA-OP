// src/modules/locations/locations.routes.ts
import { Router } from "express";
import {
  handleGetLocations,
  handleGetLocation,
  handleCreateLocation,
  handleUpdateLocation,
  handleDeleteLocation,
} from "./locations.controller";

export const locationsRouter = Router();

// GET /locations        -> lista todos ou busca com ?q=
locationsRouter.get("/", handleGetLocations);

// GET /locations/:id    -> detalhe
locationsRouter.get("/:id", handleGetLocation);

// POST /locations       -> cria
locationsRouter.post("/", handleCreateLocation);

// PUT /locations/:id    -> atualiza
locationsRouter.put("/:id", handleUpdateLocation);

// DELETE /locations/:id -> remove
locationsRouter.delete("/:id", handleDeleteLocation);
