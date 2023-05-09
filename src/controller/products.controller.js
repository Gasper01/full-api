import db from '../db/config.connection';
export const createProduct = async (req, res) => {
  const { titulo } = req.body;
  try {
    const newProduct = {
      titulo,
    };
    await db.collection('products').add(newProduct);
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await db.collection('products').get();
    const response = products.docs.map((doc) => ({
      id: doc.id,
      titulo: doc.data().titulo,
    }));
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500);
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
      titulo: productsDoc.data().titulo,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500);
  }
};

export const updateProductById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId);
    const productId = await products.get();

    if (!productId.exists) {
      return res.status(404).json('No product found with id');
    }

    const titulo = req.body;

    await products.update(titulo);

    return res.status(200);
  } catch (error) {
    return res.status(500);
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
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
};
