import { Router } from 'express';
import { getUser, getUserById } from '../controller/users.controllers';
const router = Router();

router.get('/', getUser);
router.get('/:userId', getUserById);
export default router;
