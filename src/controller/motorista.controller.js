import { clearCacheMotorista, motoristasCache } from "../cache/cache";
import db from "../db/config.connection";

// Objeto para almacenar en caché los resultados de las consultas

export const createMotorista = async (req, res) => {
  const { motoristaName, cars, placa } = req.body;
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
      cars,
      placa,
    };

    await db.collection("motoristas").add(newMotorista);
    clearCacheMotorista();
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
      cars: doc.data().cars,
      placa: doc.data().placa,
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

export const updateMotorista = async (req, res) => {
  const { id } = req.params; // Obtén el ID del motorista de los parámetros de la ruta
  const { cars, placa } = req.body; // Obtén los datos actualizados de la solicitud
  try {
    // Verificar si el motorista existe
    const motoristaRef = db.collection("motoristas").doc(id);
    const motoristaDoc = await motoristaRef.get();

    if (!motoristaDoc.exists) {
      // Si el motorista no existe, devuelve un error
      return res.status(404).json({ message: "Motorista not found" });
    }

    // Actualiza los campos cars y placa del motorista
    await motoristaRef.update({ cars, placa });

    // Limpiar la caché del motorista (si es necesario)
    clearCacheMotorista();

    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
