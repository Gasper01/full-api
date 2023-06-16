import { Router } from "express";
import { verifyToken } from "../middlewares/verifyJwt";
import dataValidateHandler from "../middlewares/dataValidateHandler";
import salidasModel from "../models/salidas.model";
import {
  DeleteSalidasById,
  aprobarSalidas,
  createSalidas,
  getSalidasById,
  getSalidasByIdUser,
  getSalidasNoaprovadas,
  updateSalidasById,
} from "../controller/salidas.controller";

const router = Router();

router.get("/", getSalidasNoaprovadas);
router.get("/:salidaId", getSalidasById);
router.get("/user/:Iduser/:page", getSalidasByIdUser);
router.post("/", verifyToken, createSalidas);
router.post("/aprobar/:salidaId", verifyToken, aprobarSalidas);
router.put("/:salidaId", updateSalidasById);
router.delete("/:salidaId", DeleteSalidasById);
export default router;
