import { Router } from "express";
import {
  deleteUserById,
  getUser,
  getUserById,
} from "../controller/users.controllers";
import { verifyToken } from "../middlewares/verifyJwt";
const router = Router();

router.get("/", getUser);
router.delete("/:userId", verifyToken, deleteUserById);
router.get("/verifyuser", verifyToken, getUserById);
export default router;
