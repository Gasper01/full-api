import { Router } from 'express';
import { getUser, getUserById } from '../controller/users.controllers';
import { verifyToken } from '../middlewares/verifyJwt';
import { verifyRoles } from '../middlewares/verifyRoles';
const router = Router();

router.get('/', verifyRoles, getUser);
router.get('/verifyuser', verifyToken, getUserById);
export default router;
