import Jwt from 'jsonwebtoken';
import db from '../db/config.connection';
import userModel from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const userExists = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    const user = userExists.docs[0];

    if (!user) {
      return res.status(400).json({ message: 'User not exists' });
    }

    const passwordMatch = await userModel.comparePassword(
      password,
      user.data().password
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password not match' });
    }

    const token = Jwt.sign({ id: user.id }, process.env.SECREJWTJSON, {
      expiresIn: '5h',
    });

    // res.cookie('cib-cookie', token, {
    //   maxAge: 3600000, // tiempo de vida de la cookie (en milisegundos)
    //   httpOnly:true, // la cookie solo será accesible desde el servidor
    //   secure: true, // la cookie solo será enviada a través de HTTPS
    //  sameSite: 'none', // la cookie estará disponible en cualquier sitio web
    //  path: '/',
    //});

    return res.status(200).json(token);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const singUp = async (req, res) => {
  const { imgUrl, username, email, password, rol } = req.body;
  try {
    // Verificar si el usuario ya existe
    const userExists = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (!userExists.empty) {
      // Si el usuario ya existe, devolver un error
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      imgUrl,
      username,
      email,
      password: userModel.hashPassword(password),
      rol,
    };

    await db.collection('users').add(newUser);

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    return res

      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
