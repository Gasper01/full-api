import { Router } from "express";
import {
  UpdateUser,
  deleteUserById,
  getUser,
  getUserById,
} from "../controller/users.controllers";
import { verifyRoles } from "../middlewares/verifyRoles";
import { verifyToken } from "../middlewares/verifyJwt";
const router = Router();

router.get("/",verifyToken, verifyRoles, getUser);
router.delete("/:userId", verifyToken, deleteUserById);
router.get("/verifyuser", verifyToken, getUserById);
router.put("/:userId", verifyToken, UpdateUser);
export default router;
