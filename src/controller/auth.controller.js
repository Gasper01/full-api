import Jwt from 'jsonwebtoken';
import db from '../db/config.connection';
import outputHandler from '../middlewares/outputHandler';
import userModel from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

export const singUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verificar si el usuario ya existe
    const userExists = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!userExists.empty) {
      // Si el usuario ya existe, devolver un error
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      username,
      email,
      password: userModel.hashPassword(password),
      rol: 'user',
    };

    await db.collection('users').add(newUser);

    return res.send(outputHandler('200'));
  } catch (error) {
    console.log(error);
    return res.send(outputHandler('500'));
  }
};
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send(outputHandler('400', 'Missing email or password'));
    }

    const userExists = await db.collection('users').where('email', '==', email).limit(1).get();
    const user = userExists.docs[0];

    if (!user) {
      return res.send(outputHandler('400', 'User does not exist'));
    }
    // const userfont =await user.finndOne({email:req.body.email}).pulpulate("roles")
    const passwordMatch = await userModel.comparePassword(password, user.data().password);
    if (!passwordMatch) {
      return res.send(outputHandler('400', 'Password not match'));
    }

    const token = Jwt.sign({ id: user.id }, process.env.SECREJWTJSON, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    res.send(outputHandler('400', 'Internal server error'));
  }
};
