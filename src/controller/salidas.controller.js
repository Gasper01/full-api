import db from "../db/config.connection";
let SalidasNoaprovadascache = {};
let SalidasCacheId = {};
let SalidasByIdUser = {};

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
      const { id, nombre, cantidad, cantidadAdd, sistema } = producto;

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
          cantidad,
          cantidadAdd,
          sistema,
        });
      } else {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
    }

    await db.collection("Salidas").add(newSalidas);
    SalidasNoaprovadascache = {};
    SalidasByIdUser = {};
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
      return res.status(404).json({ message: "Salida no encontrada" });
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
        await productRef.update({
          cantidad: nuevaCantidad,
        });
      } else {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
    }

    // Agregar el campo "aprobada" a la colección de Salidas
    await salidaRef.update({
      aprobada: true,
    });
    SalidasNoaprovadascache = {};
    SalidasByIdUser = {};

    return res
      .status(200)
      .json({ message: "Salida aprobada y cantidades actualizadas" });
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
      return res.status(403).json({ message: `Salida not found with id ` });
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
      aprobada: doc.data().aprobada,
      destino: doc.data().destino,
      fecha: doc.data().fecha,
      motorista: doc.data().motorista,
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
export const getSalidasByIdUser = async (req, res) => {
  const { Iduser, page } = req.params;
  let limit = 10;

  // Verificar si la respuesta está en la caché
  if (SalidasByIdUser[Iduser]) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const salidas = SalidasByIdUser[Iduser].slice(startIndex, endIndex);

    const totalPages = Math.ceil(SalidasByIdUser[Iduser].length / limit);

    res.status(200).json({ salidas, totalPages });
    return;
  }

  const Salidas = db.collection("Salidas");
  let query = Salidas.where("userId", "==", Iduser);

  try {
    const snapshot = await query.get();
    const salidas = [];

    snapshot.forEach((doc) => {
      salidas.push({ id: doc.id, ...doc.data() });
    });

    // Ordenar las salidas por fecha ascendente

    salidas.sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Guardar la respuesta en la caché
    SalidasByIdUser[Iduser] = salidas;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSalidas = salidas.slice(startIndex, endIndex);
    const totalPages = Math.ceil(salidas.length / limit);

    res.status(200).json({ salidas: paginatedSalidas, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Error getting salidas by User ID" });
  }
};
export const updateSalidasById = async (req, res) => {
  const { salidaId } = req.params; // Obtén el ID de la salida de la solicitud

  try {
    const { productos } = req.body;

    // Obtén la salida existente de la base de datos
    const salidaRef = db.collection("Salidas").doc(salidaId);
    const salidaDoc = await salidaRef.get();

    if (!salidaDoc.exists) {
      return res.status(403).json({ message: "Salida not found with id" });
    }

    const updataSalidas = salidaDoc.data();
    const updatedProductos = [];

    // Realiza las comprobaciones para los productos actualizados
    for (const producto of productos) {
      const { id, nombre, cantidad, cantidadAdd, sistema } = producto;

      const productRef = db.collection("products").doc(id);
      const productSnapshot = await productRef.get();

      if (productSnapshot.exists) {
        const productData = productSnapshot.data();

        // Suma todas las cantidades adicionales para los productos con el mismo ID
        let sumacantidad = 0;
        for (const prod of productos) {
          if (prod.id === id) {
            sumacantidad += prod.cantidadAdd;
          }
        }

        // Comprueba si la suma de las cantidades añadidas supera la cantidad existente
        if (sumacantidad > productData.cantidad) {
          return res.status(400).json({
            message:
              "Supera la cantidad existente. Nombre: " +
              productData.nombre +
              ", Existente: " +
              productData.cantidad,
          });
        }

        // Agrega el producto al array de productos de la salida
        updatedProductos.push({
          id,
          nombre,
          cantidad,
          cantidadAdd,
          sistema,
        });
      } else {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
    }

    updataSalidas.productos = updatedProductos;
    await salidaRef.update(updataSalidas);
    SalidasByIdUser = {};
    SalidasCacheId = {};
    return res
      .status(200)
      .json({ message: "Salida actualizada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la salida" });
  }
};
export const DeleteSalidasById = async (req, res) => {
  try {
    const Salidas = db.collection("Salidas").doc(req.params.salidaId);
    const SalidaId = await Salidas.get();

    if (!SalidaId.exists) {
      return res.status(404).json({ message: "No Salida found with id" });
    }

    await Salidas.delete();
    SalidasByIdUser = {};
    SalidasCacheId = {};
    SalidasNoaprovadascache = {};
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
