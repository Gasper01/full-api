import { Router } from 'express';
import { signIn, signUp } from '../controller/auth.controller';
import { verifyRoles } from '../middlewares/verifyRoles';
import { verifyToken } from '../middlewares/verifyJwt';
import dataValidateHandler from '../middlewares/dataValidateHandler';
import userModel from '../models/user.model';
const router = Router();

router.post(
  '/singup',
  verifyToken,
  verifyRoles,
  dataValidateHandler(userModel.userdata),
  signUp
);
router.post('/signIn', signIn);

export default router;
