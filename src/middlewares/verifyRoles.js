import db from '../db/config.connection'
import outputHandler from './outputHandler'
export const verifyRoles = async (req, res, next) => {
  try {
    const user = await db.collection('users').doc(req.userId).get()

    if (user.data().rol === 'admin') {
      return next()
    }

    return res.send(outputHandler('403', 'User rol Anauthorizes'))
  } catch (error) {
    return res.send(outputHandler('500', 'Anauthorized'))
  }
}
