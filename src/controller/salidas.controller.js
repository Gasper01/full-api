import db from '../db/config.connection';

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

      const productRef = db.collection('products').doc(id);
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
              'Supera la cantidad existente  ' +
              '  Nombre: ' +
              productData.nombre +
              '  Existente: ' +
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
        return res.status(404).json('Producto no encontrado');
      }
    }

    await db.collection('Salidas').add(newSalidas);
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Se produjo un error inesperado en el servidor' });
  }
};

export const aprobarSalidas = async (req, res) => {
  const { salidaId } = req.params;

  try {
    const salidaRef = db.collection('Salidas').doc(salidaId);
    const salidaSnapshot = await salidaRef.get();

    if (!salidaSnapshot.exists) {
      return res.status(404).json('Salida no encontrada');
    }

    const salidaData = salidaSnapshot.data();
    const { productos } = salidaData;

    // Actualizar la cantidad en la colección de productos
    for (const producto of productos) {
      const { id, cantidadAdd } = producto;

      const productRef = db.collection('products').doc(id);
      const productSnapshot = await productRef.get();

      if (productSnapshot.exists) {
        const productData = productSnapshot.data();
        const nuevaCantidad = productData.cantidad - cantidadAdd;

        await productRef.update({
          cantidad: nuevaCantidad,
        });
      } else {
        return res.status(404).json('Producto no encontrado');
      }
    }

    // Agregar el campo "aprobada" a la colección de Salidas
    await salidaRef.update({
      aprobada: true,
    });

    return res.status(200).json('Salida aprobada y cantidades actualizadas');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Se produjo un error inesperado en el servidor' });
  }
};

export const getSalidasNoaprovadas = async (req, res) => {
  try {
    const Salidas = await db
      .collection('Salidas')
      .where('aprobada', '==', false)
      .get();
    const response = await Promise.all(
      Salidas.docs.map(async (doc) => {
        const userId = doc.data().userId;
        const userSnapshot = await db.collection('users').doc(userId).get();
        const userData = {
          username: userSnapshot.data().username,
          email: userSnapshot.data().email,
          imgUrl: userSnapshot.data().imgUrl,
        };
        return {
          id: doc.id,
          fecha: doc.data().fecha,
          destino: doc.data().destino,
          user: userData, // Agrega los datos del usuario al objeto de respuesta
        };
      })
    );
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Se produjo un error inesperado en el servidor' });
  }
};

export const getSalidasById = async (req, res) => {
  const { salidaId } = req.params;
  try {
    const Salidas = db.collection('Salidas').doc(salidaId);
    const doc = await Salidas.get();

    if (!doc.exists) {
      return res.status(403).json('Salidas found with id ');
    }

    const response = {
      id: doc.id,
      fecha: doc.data().fecha,
      destino: doc.data().destino,
      productos: doc.data().productos,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
