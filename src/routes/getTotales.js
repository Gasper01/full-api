import { Router } from "express";
import { GetTotales } from "../controller/totales";
const router = Router();

router.get("/", GetTotales);
export default router;
