import { Router } from 'express';
import { signIn, singUp } from '../controller/auth.controller';
const router = Router();

router.post('/singup', singUp);
router.post('/signIn', signIn);

export default router;
