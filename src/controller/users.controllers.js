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
  console.log(req.user);
  try {
    const users = db.collection('users').doc(req.userId);
    const userDoc = await users.get();

    if (!userDoc.exists) {
      return res.status(403).json('User found with id ');
    }

    const response = {
      id: userDoc.id,
      username: userDoc.data().username,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};
