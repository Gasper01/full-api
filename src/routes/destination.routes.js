import { Router } from 'express';
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


router.get('/', getDestinations);
router.get('/:search', getLocationByDestination);

router.post(
  '/locations',
  verifyToken,
  dataValidateHandler(locationModel),
  createLocations
);

router.post(
  '/',
  verifyToken,
  dataValidateHandler(destinationsModel),
  createDestinations
);

export default router;
