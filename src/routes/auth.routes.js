import { Router } from 'express'
import { signIn, singUp } from '../controller/auth.controller'
const router = Router()

router.post('/singUp', singUp)
router.get('/signIn', signIn)

export default router
