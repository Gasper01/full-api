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

import destinationsModel from '../models/destinations.model';
import locationModel from '../models/location.model';
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
export default router;
