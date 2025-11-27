import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { locationsRouter } from "./modules/locations";
import { schemesRouter } from "./modules/schemes";
import { schemePointsRouter } from "./modules/schemePoints"; // 👈 novo

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);

app.use(express.json());

app.get("/status", (_req, res) => {
  res.json({ status: "ok", message: "API operacional rodando 🚍" });
});

app.use("/locations", locationsRouter);
app.use("/schemes", schemesRouter);
app.use("/scheme-points", schemePointsRouter); // 👈 novo

app.listen(port, () => {
  console.log(`🚀 API rodando em http://localhost:${port}`);
});
