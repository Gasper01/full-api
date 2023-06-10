import db from "../db/config.connection";
let SalidasNoaprovadascache = {};
let SalidasCacheId = {};

export const createSalidas = async (req, res) => {
  const { fecha, destino, motorista, userId, productos } = req.body;
  try {
    const newSalidas = {
      fecha,
      destino,
      motorista,
      userId,
      aprobada: false,
      productos: [],
    };

    for (const producto of productos) {
      const { id, nombre, cantidadAdd, sistema } = producto;

      const productRef = db.collection("products").doc(id);
      const productSnapshot = await productRef.get();

      if (productSnapshot.exists) {
        const productData = productSnapshot.data();
        let sumacantidad = 0;

        // Suma todas las cantidades adicionales para los productos con el mismo ID
        for (const prod of productos) {
          if (prod.id === id) {
            sumacantidad += prod.cantidadAdd;
          }
        }

        // Comprueba si la suma de las cantidades añadidas supera la cantidad existente
        if (sumacantidad > productData.cantidad) {
          return res.status(400).json({
            message:
              "Supera la cantidad existente  " +
              "  Nombre: " +
              productData.nombre +
              "  Existente: " +
              productData.cantidad,
          });
        }

        // Agrega el producto al array de productos de la salida
        newSalidas.productos.push({
          id,
          nombre,
          cantidadAdd,
          sistema,
        });
      } else {
        return res.status(404).json("Producto no encontrado");
      }
    }

    await db.collection("Salidas").add(newSalidas);
    SalidasNoaprovadascache = {};

    return res.status(200).json("ok");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Se produjo un error inesperado en el servidor" });
  }
};

export const aprobarSalidas = async (req, res) => {
  const { salidaId } = req.params;

  try {
    const salidaRef = db.collection("Salidas").doc(salidaId);
    const salidaSnapshot = await salidaRef.get();

    if (!salidaSnapshot.exists) {
      return res.status(404).json("Salida no encontrada");
    }

    const salidaData = salidaSnapshot.data();
    const { productos } = salidaData;

    // Actualizar la cantidad en la colección de productos
    for (const producto of productos) {
      const { id, cantidadAdd } = producto;

      const productRef = db.collection("products").doc(id);
      const productSnapshot = await productRef.get();

      if (productSnapshot.exists) {
        const productData = productSnapshot.data();
        const nuevaCantidad = productData.cantidad - cantidadAdd;

        await productRef.update({
          cantidad: nuevaCantidad,
        });
      } else {
        return res.status(404).json("Producto no encontrado");
      }
    }

    // Agregar el campo "aprobada" a la colección de Salidas
    await salidaRef.update({
      aprobada: true,
    });

    return res.status(200).json("Salida aprobada y cantidades actualizadas");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Se produjo un error inesperado en el servidor" });
  }
};

export const getSalidasNoaprovadas = async (req, res) => {
  try {
    // Verificar si los resultados están en la caché
    if (SalidasNoaprovadascache.salidasNoAprobadas) {
      return res.status(200).json(SalidasNoaprovadascache.salidasNoAprobadas);
    }

    const Salidas = await db
      .collection("Salidas")
      .where("aprobada", "==", false)
      .get();

    const response = await Promise.all(
      Salidas.docs.map(async (doc) => {
        const userId = doc.data().userId;

        // Verificar si los datos del usuario están en la caché
        let userData;
        if (
          SalidasNoaprovadascache.users &&
          SalidasNoaprovadascache.users[userId]
        ) {
          userData = SalidasNoaprovadascache.users[userId];
        } else {
          // Consultar los datos del usuario en Firebase
          const [userSnapshot] = await Promise.all([
            db.collection("users").doc(userId).get(),
          ]);

          userData = {
            username: userSnapshot.data().username,
            email: userSnapshot.data().email,
            imgUrl: userSnapshot.data().imgUrl,
          };

          // Almacenar los datos del usuario en la caché
          if (!SalidasNoaprovadascache.users) {
            SalidasNoaprovadascache.users = {};
          }
          SalidasNoaprovadascache.users[userId] = userData;
        }

        return {
          id: doc.id,
          fecha: doc.data().fecha,
          destino: doc.data().destino,
          user: userData, // Agregar los datos del usuario al objeto de respuesta
        };
      })
    );

    // Almacenar los resultados en la caché
    SalidasNoaprovadascache.salidasNoAprobadas = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Se produjo un error inesperado en el servidor" });
  }
};

export const getSalidasById = async (req, res) => {
  const { salidaId } = req.params;
  try {
    // Verificar si el resultado está en la caché
    if (SalidasCacheId[salidaId]) {
      return res.status(200).json(SalidasCacheId[salidaId]);
    }

    const Salidas = db.collection("Salidas").doc(salidaId);
    const doc = await Salidas.get();

    if (!doc.exists) {
      return res.status(403).json(`Salida not found with id ${salidaId}`);
    }

    const userDataPromise = db.collection("users").doc(doc.data().userId).get();

    const [userDataSnapshot] = await Promise.all([userDataPromise]);

    const userData = {
      username: userDataSnapshot.data().username,
      email: userDataSnapshot.data().email,
      imgUrl: userDataSnapshot.data().imgUrl,
    };

    const response = {
      id: doc.id,
      fecha: doc.data().fecha,
      destino: doc.data().destino,
      user: userData,
      productos: doc.data().productos,
    };

    // Almacenar el resultado en la caché
    SalidasCacheId[salidaId] = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
