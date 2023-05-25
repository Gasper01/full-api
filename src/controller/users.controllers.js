import db from '../db/config.connection';
export const getUser = async (req, res) => {
  try {
    const users = await db.collection('users').get();
    const data = users.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      email: doc.data().email,
      imgUrl: doc.data().imgUrl,
      rol: doc.data().rol,
    }));
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
export const getUserById = async (req, res) => {
  try {
    const users = db.collection('users').doc(req.userId);
    const userDoc = await users.get();

    if (!userDoc.exists) {
      return res.status(403).json('User found with id ');
    }

    const response = {
      id: userDoc.id,
      imgUrl: userDoc.data().imgUrl,
      username: userDoc.data().username,
      email: userDoc.data().email,
      rol: userDoc.data().rol,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const users = db.collection('users').doc(req.params.userId);
    const userId = await users.get();

    if (!userId.exists) {
      return res.status(404).json('No product found with id');
    }

    await users.delete();
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
