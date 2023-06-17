import db from "../db/config.connection";
export const getUser = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const userDataPromises = usersSnapshot.docs.map(async (doc) => {
      const userId = doc.id;
      const userCacheData = userCache[userId];

      const userData = {
        id: userId,
        username: doc.data().username,
        email: doc.data().email,
        imgUrl: doc.data().imgUrl,
        rol: doc.data().rol,
      };

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

    return res.status(200).json(userData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const deleteUserById = async (req, res) => {
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
