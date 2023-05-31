import { Router } from 'express';
import { verifyRoles } from '../middlewares/verifyRoles';
import { verifyToken } from '../middlewares/verifyJwt';

import dataValidateHandler from '../middlewares/dataValidateHandler';

import { createLocations } from '../controller/location.controller';
import {
  createDestinations,
  getDestinations,
  getLocationByDestination,
} from '../controller/destination.contoller';

import {
  createMotorista,
  getMotorista,
} from '../controller/motorista.controller';

import destinationsModel from '../models/destinations.model';
import locationModel from '../models/location.model';
import motoristaModel from '../models/mortorista.model';
const router = Router();

router.post(
  '/',
  verifyToken,
  verifyRoles,
  dataValidateHandler(destinationsModel),
  createDestinations
);
router.get('/', verifyToken, verifyRoles, getDestinations);
router.get('/:search', verifyToken, verifyRoles, getLocationByDestination);
router.post(
  '/locations',
  verifyToken,
  verifyRoles,
  dataValidateHandler(locationModel),
  createLocations
);
router.get('/motoristas/', verifyToken, verifyRoles, getMotorista);
router.post(
  '/motoristas',
  verifyToken,
  verifyRoles,
  dataValidateHandler(motoristaModel),
  createMotorista
);

export default router;
