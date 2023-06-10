import db from "../db/config.connection";
let roleCache = {};

export const verifyRoles = async (req, res, next) => {
  try {
    const user = await getUserFromCache(req.userId);

    if (user.rol === "admin") {
      return next();
    }

    return res.status(403).json({ message: "User role unauthorized" });
  } catch (error) {
    return res.status(500).json({ message: "Unauthorized" });
  }
};

async function getUserFromCache(userId) {
  if (roleCache[userId]) {
    return roleCache[userId];
  }

  const userSnapshot = await db.collection("users").doc(userId).get();
  const user = userSnapshot.data();

  // Guardar el usuario en la caché
  roleCache[userId] = user;

  return user;
}
