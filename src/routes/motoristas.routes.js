import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyJwt';
import dataValidateHandler from '../middlewares/dataValidateHandler';
import {
  createMotorista,
  getMotorista,
} from '../controller/motorista.controller';

import motoristaModel from '../models/mortorista.model';
const router = Router();

router.get('/', getMotorista);
router.post(
  '/',
  verifyToken,
  dataValidateHandler(motoristaModel),
  createMotorista
);

export default router;
