import db from '../db/config.connection';

export const getUser = async (req, res) => {
  try {
    const users = await db.collection('users').get();
    const data = users.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      email: doc.data().email,
      password: doc.data().password,
      rol: doc.data().rol,
    }));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500);
  }
};
export const getUserById = async (req, res) => {
  try {
    const users = await db.collection('users').doc(req.params.userId).user.get();

    const data = users.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      email: doc.data().email,
      password: doc.data().password,
      rol: doc.data().rol,
    }));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500);
  }
};
