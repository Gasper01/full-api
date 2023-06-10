import db from "../db/config.connection";

// Objeto para almacenar en caché los resultados de las consultas
let motoristasCache = {};

export const createMotorista = async (req, res) => {
  const { motoristaName, placa, cars } = req.body;

  try {
    // Verificar si el motorista ya existe
    const motoristaSnapshotPromise = db
      .collection("motoristas")
      .where("motoristaName", "==", motoristaName)
      .limit(1)
      .get();

    const [motoristaSnapshot] = await Promise.all([motoristaSnapshotPromise]);

    if (!motoristaSnapshot.empty) {
      // Si el motorista ya existe, devolver un error
      return res.status(400).json({ message: "Motorista already exists" });
    }

    const newMotorista = {
      motoristaName,
      placa,
      cars,
    };

    await db.collection("motoristas").add(newMotorista);
    motoristasCache = {};
    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const getMotorista = async (req, res) => {
  try {
    // Verificar si los motoristas están en la caché
    if (motoristasCache.data) {
      return res.status(200).json(motoristasCache.data);
    }

    const motoristasSnapshotPromise = db.collection("motoristas").get();

    const [motoristasSnapshot] = await Promise.all([motoristasSnapshotPromise]);

    const response = motoristasSnapshot.docs.map((doc) => ({
      id: doc.id,
      motoristaName: doc.data().motoristaName,
    }));

    // Almacenar los motoristas en la caché
    motoristasCache.data = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
