import Jwt from 'jsonwebtoken';
import db from '../db/config.connection';
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

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'An unexpected error occurred on the server' });
  }
};
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const userExists = await db.collection('users').where('email', '==', email).limit(1).get();
    const user = userExists.docs[0];

    if (!user) {
      return res.status(400).json({ message: 'User not exists' });
    }
    
    const passwordMatch = await userModel.comparePassword(password, user.data().password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password not match' });
    }

    const token = Jwt.sign({ id: user.id }, process.env.SECREJWTJSON, { expiresIn: '1h' });
  
    
    return res.status(200).json(token)
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred on the server' });
  }
};
