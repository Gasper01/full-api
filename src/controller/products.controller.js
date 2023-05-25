import db from '../db/config.connection';

export const createProduct = async (req, res) => {
  const { nombre, cantidad, codigo, unidad } = req.body;

  try {
    const newProduct = {
      nombre,
      cantidad,
      codigo,
      unidad,
    };
    await db.collection('products').add(newProduct);
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await db.collection('products').get();
    const response = products.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
    }));
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const getProductsById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId);
    const productsDoc = await products.get();

    if (!productsDoc.exists) {
      return res.status(403).json('No product found with id ');
    }

    const response = {
      id: productsDoc.id,
      nombre: productsDoc.data().nombre,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const updateProductById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId);
    const productId = await products.get();

    if (!productId.exists) {
      return res.status(404).json('No product found with id');
    }

    const nombre = req.body;

    await products.update(nombre);

    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId);
    const productId = await products.get();

    if (!productId.exists) {
      return res.status(404).json('No product found with id');
    }

    await products.delete();
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { search } = req.params; // Obtener el término de búsqueda desde los parámetros de la URL

    let productsRef = db.collection('products');

    if (search) {
      productsRef = productsRef
        .where('nombre', '>=', search)
        .where('nombre', '<=', search + '\uf8ff');
    }

    const productsSnapshot = await productsRef.get();

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos.' });
    }

    const response = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
      cantidad: doc.data().cantidad,
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
