import db from '../db/config.connection'
import outputHandler from '../middlewares/outputHandler'

export const getUser = async (req, res) => {
  try {
    const users = await db.collection('users').get()
    const data = users.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
      email: doc.data().email,
      password: doc.data().password,
      rol: doc.data().rol
    }))
    return res.send(outputHandler('200', data))
  } catch (error) {
    return res.send(outputHandler('500', null))
  }
}
