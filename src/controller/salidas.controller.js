import db from "../db/config.connection";
import { cache, clearCacheNode } from "../cache/cache";

export const aprobarSalidas = async (req, res) => {
  clearCacheNode();
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
    // Intenta obtener los resultados de la caché
    const cacheKey = "salidasNoaprovadas";
    let response = cache.get(cacheKey);

    if (!response) {
      // Si los resultados no están en la caché, realiza la consulta a la base de datos
      const Salidas = await db
        .collection("Salidas")
        .where("aprobada", "==", false)
        .get();

      // Procesa los resultados y agrega los datos del usuario
      response = await Promise.all(
        Salidas.docs.map(async (doc) => {
          const userId = doc.data().userId;

          {
            // Consultar los datos del usuario en Firebase
            const [userSnapshot] = await Promise.all([
              db.collection("users").doc(userId).get(),
            ]);

            const userData = {
              username: userSnapshot.data().username,
              email: userSnapshot.data().email,
              imgUrl: userSnapshot.data().imgUrl,
            };

            return {
              id: doc.id,
              fecha: doc.data().fecha,
              destino: doc.data().destino,
              user: userData, // Agregar los datos del usuario al objeto de respuesta
            };
          }
        })
      );

      // Almacena los resultados en la caché con un tiempo de vida de 1 hora (3600 segundos)
      cache.set(cacheKey, response, 3600);
    }

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
    // Intenta obtener los resultados de la caché
    const cacheKey = `salidaById_${salidaId}`;
    let response = cache.get(cacheKey);

    if (!response) {
      // Si los resultados no están en la caché, realiza la consulta a la base de datos
      const Salidas = db.collection("Salidas").doc(salidaId);
      const doc = await Salidas.get();

      if (!doc.exists) {
        return res
          .status(403)
          .json({ message: `Salida not found with id ${salidaId}` });
      }

      const userDataPromise = db
        .collection("users")
        .doc(doc.data().userId)
        .get();

      const [userDataSnapshot] = await Promise.all([userDataPromise]);

      const userData = {
        username: userDataSnapshot.data().username,
        email: userDataSnapshot.data().email,
        imgUrl: userDataSnapshot.data().imgUrl,
      };

      response = {
        id: doc.id,
        aprobada: doc.data().aprobada,
        destino: doc.data().destino,
        fecha: doc.data().fecha,
        motorista: doc.data().motorista,
        user: userData,
        productos: doc.data().productos,
      };

      // Almacena los resultados en la caché con un tiempo de vida de 1 hora (3600 segundos)
      cache.set(cacheKey, response, 3600);
    }

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

  try {
    // Intenta obtener los resultados de la caché
    const cacheKey = `salidasByIdUser_${Iduser}_${page}`;
    let response = cache.get(cacheKey);

    if (!response) {
      const Salidas = db.collection("Salidas");
      let query = Salidas.where("userId", "==", Iduser);

      const snapshot = await query.get();
      const salidas = [];

      snapshot.forEach((doc) => {
        salidas.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar las salidas por fecha ascendente
      salidas.sort((a, b) => b.fecha.localeCompare(a.fecha));

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedSalidas = salidas.slice(startIndex, endIndex);
      const totalPages = Math.ceil(salidas.length / limit);

      response = { salidas: paginatedSalidas, totalPages };

      // Almacena los resultados en la caché con un tiempo de vida de 1 hora (3600 segundos)
      cache.set(cacheKey, response, 3600);
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error getting salidas by User ID" });
  }
};
export const createSalidas = async (req, res) => {
  clearCacheNode();
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

    return res.status(200).json("ok");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Se produjo un error inesperado en el servidor" });
  }
};
export const updateSalidasById = async (req, res) => {
  clearCacheNode();
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

    return res
      .status(200)
      .json({ message: "Salida actualizada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la salida" });
  }
};
export const DeleteSalidasById = async (req, res) => {
  clearCacheNode();
  try {
    const Salidas = db.collection("Salidas").doc(req.params.salidaId);
    const SalidaId = await Salidas.get();

    if (!SalidaId.exists) {
      return res.status(404).json({ message: "No Salida found with id" });
    }

    await Salidas.delete();
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
