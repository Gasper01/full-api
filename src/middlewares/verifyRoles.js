import db from '../db/config.connection';
export const verifyRoles = async (req, res, next) => {
  try {
    const user = await db.collection('users').doc(req.userId).get();

    if (user.data().rol === 'admin') {
      return next();
    }

    return res.status(403).json({ message: 'User rol Anauthorizes ' });
  } catch (error) {
    return res.status(500).json({ message: 'Anauthorized ' });
  }
};
