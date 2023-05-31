import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import { verifyToken } from '../middlewares/verifyJwt';
import dataValidateHandler from '../middlewares/dataValidateHandler';
import {
  createMotorista,
  getMotorista,
} from '../controller/motorista.controller';

import motoristaModel from '../models/mortorista.model';
const router = Router();

router.get('/', verifyToken, verifyRoles, getMotorista);
router.post(
  '/',
  verifyToken,
  verifyRoles,
  dataValidateHandler(motoristaModel),
  createMotorista
);

export default router;
