import Jwt from 'jsonwebtoken'

import db from '../db/config.connection'
import outputHandler from './outputHandler'
import dotenv from 'dotenv'
dotenv.config()
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token']

    if (!token) return res.send(outputHandler('403', 'No token provided'))
    const decoded = Jwt.verify(token, process.env.SECREJWTJSON)
    req.userId = decoded.id
    const user = await db.collection('users').doc(req.userId).get()

    if (user.exists) {
      return next()
    }
    return res.send(outputHandler('403', 'Not user Verify'))
  } catch (error) {
    return res.send(outputHandler('500', 'Anauthorized'))
  }
}
