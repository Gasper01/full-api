import Jwt from "jsonwebtoken";
import db from "../db/config.connection";
import dotenv from "dotenv";
dotenv.config();
let tokenCache = {};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    // Comprobar si el token existe en la caché
    if (tokenCache[token]) {
      req.userId = tokenCache[token];
      return next();
    }

    const decoded = Jwt.verify(token, process.env.SECREJWTJSON);
    req.userId = decoded.id;

    const userSnapshot = await db.collection("users").doc(req.userId).get();

    if (userSnapshot.exists) {
      // Almacenar el token en la caché
      tokenCache[token] = req.userId;
      return next();
    } else {
      return res.status(403).json({ message: "User not verified" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Anauthorized" });
  }
};
