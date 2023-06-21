import db from "../db/config.connection";

export const GetTotales = async (req, res) => {
  try {
    const salidasPromise = db.collection("Salidas").get();
    const devolucionesPromise = db.collection("devoluciones").get();
    const userPromise = db.collection("users").get();
    const motoristasPromise = db.collection("motoristas").get();
    const productsPromise = db.collection("products").get();
    const [
      salidasSnapshot,
      devolucionesSnapshot,
      userSnapshot,
      motoristasSnapshot,
      productsSnapshot,
    ] = await Promise.all([
      salidasPromise,
      devolucionesPromise,
      userPromise,
      motoristasPromise,
      productsPromise,
    ]);

    const salidasTotal = salidasSnapshot.size;
    const devolucionesTotal = devolucionesSnapshot.size;
    const userTotal = userSnapshot.size;
    const motoristasTotal = motoristasSnapshot.size;
    const productsTotal = productsSnapshot.size;
    return res.status(200).json({
      salidas: salidasTotal,
      devoluciones: devolucionesTotal,
      user: userTotal,
      motoristas: motoristasTotal,
      products: productsTotal,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Se produjo un error inesperado en el servidor" });
  }
};
