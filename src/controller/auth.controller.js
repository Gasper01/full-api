import Jwt from "jsonwebtoken";
import db from "../db/config.connection";
import userModel from "../models/user.model";
import dotenv from "dotenv";
dotenv.config();

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const userExistsPromise = db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    const [userExistsSnapshot] = await Promise.all([userExistsPromise]);
    const user = userExistsSnapshot.docs[0];

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const passwordMatch = await userModel.comparePassword(
      password,
      user.data().password
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = Jwt.sign({ id: user.id }, process.env.SECREJWTJSON, {
      expiresIn: "5h",
    });

    return res.status(200).json(token);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const signUp = async (req, res) => {
  const { imgUrl, username, email, password, rol } = req.body;
  try {
    if (!imgUrl || !username || !email || !password || !rol) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userExistsPromise = db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    const [userExistsSnapshot] = await Promise.all([userExistsPromise]);
    if (!userExistsSnapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = userModel.hashPassword(password);

    const newUser = {
      imgUrl,
      username,
      email,
      password: hashedPassword,
      rol,
      anable: true,
    };

    await db.collection("users").add(newUser);

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
