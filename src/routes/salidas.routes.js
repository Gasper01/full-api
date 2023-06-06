import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import { verifyToken } from '../middlewares/verifyJwt';
import dataValidateHandler from '../middlewares/dataValidateHandler';
import salidasModel from '../models/salidas.model';
import {
  aprobarSalidas,
  createSalidas,
  getSalidasById,
  getSalidasNoaprovadas,
} from '../controller/salidas.controller';

const router = Router();
router.get('/', verifyToken, verifyRoles, getSalidasNoaprovadas);
router.get('/:salidaId', verifyToken, verifyRoles, getSalidasById);
router.post('/', verifyToken, verifyRoles, createSalidas);
router.post('/aprobar/:salidaId', verifyToken, verifyRoles, aprobarSalidas);
export default router;
