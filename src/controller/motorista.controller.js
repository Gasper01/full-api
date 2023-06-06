import db from '../db/config.connection';

export const createMotorista = async (req, res) => {
  const { motoristaName, placa, cars } = req.body;

  try {
    const motoristaNameExists = await db
      .collection('motoristas')
      .where('motoristaName', '==', motoristaName)
      .limit(1)
      .get();

    if (!motoristaNameExists.empty) {
      // Si el usuario ya existe, devolver un error
      return res.status(400).json({ message: 'motorista already exists' });
    }

    const newmotorista = {
      motoristaName,
      placa,
      cars,
    };
    await db.collection('motoristas').add(newmotorista);
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
export const getMotorista = async (req, res) => {
  try {
    const motoristas = await db.collection('motoristas').get();
    const response = motoristas.docs.map((doc) => ({
      id: doc.id,
      motoristaName: doc.data().motoristaName,
    }));
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
