import db from "../db/config.connection";
import { userCache, clearCacheUser } from "../cache/cache";
export const getUser = async (req, res) => {
  try {
    // Verificar si los datos de usuario están en la caché
    if (Object.keys(userCache).length !== 0) {
      return res.status(200).json(Object.values(userCache));
    }

    const usersSnapshot = await db.collection("users").get();

    const userDataPromises = usersSnapshot.docs.map(async (doc) => {
      const userId = doc.id;
      const userCacheData = userCache[userId];

      // Verificar si los datos de usuario están en la caché
      if (userCacheData) {
        return userCacheData;
      }

      const userData = {
        id: userId,
        username: doc.data().username,
        email: doc.data().email,
        imgUrl: doc.data().imgUrl,
        rol: doc.data().rol,
      };

      // Almacenar los datos de usuario en la caché
      userCache[userId] = userData;

      return userData;
    });

    const userData = await Promise.all(userDataPromises);

    return res.status(200).json(userData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.userId;

    // Verificar si los datos de usuario están en la caché
    if (userCache[userId]) {
      return res.status(200).json(userCache[userId]);
    }

    const users = db.collection("users").doc(userId);
    const userDoc = await users.get();

    if (!userDoc.exists) {
      return res.status(403).json({ message: "User not found with id" });
    }

    const userData = {
      id: userDoc.id,
      imgUrl: userDoc.data().imgUrl,
      username: userDoc.data().username,
      email: userDoc.data().email,
      rol: userDoc.data().rol,
    };

    // Almacenar los datos de usuario en la caché
    userCache[userId] = userData;

    return res.status(200).json(userData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const deleteUserById = async (req, res) => {
  clearCacheUser();
  try {
    const users = db.collection("users").doc(req.params.userId);
    const userId = await users.get();

    if (!userId.exists) {
      return res.status(404).json("No product found with id");
    }

    await users.delete();

    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
