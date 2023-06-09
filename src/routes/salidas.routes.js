import { Router } from "express";
import { verifyToken } from "../middlewares/verifyJwt";
import dataValidateHandler from "../middlewares/dataValidateHandler";
import salidasModel from "../models/salidas.model";
import {
  aprobarSalidas,
  createSalidas,
  getSalidasById,
  getSalidasNoaprovadas,
} from "../controller/salidas.controller";

const router = Router();

router.get("/", getSalidasNoaprovadas);
router.get("/:salidaId", getSalidasById);
router.post("/", verifyToken, createSalidas);
router.post("/aprobar/:salidaId", verifyToken, aprobarSalidas);
export default router;
