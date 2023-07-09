import db from "../db/config.connection";
import { productsCache, productSearchCache, clearCache } from "../cache/cache";
// Objeto para almacenar en caché los resultados de las consultas

export const createProduct = async (req, res) => {
  const { nombre, ImgUrl, cantidad, codigo, unidad, category } = req.body;

  try {
    const productcodigoExists = await db
      .collection("products")
      .where("codigo", "==", codigo)
      .limit(1)
      .get();

    if (!productcodigoExists.empty) {
      // Si el producto ya existe, devolver un error
      return res.status(400).json({ message: "product codigo already exists" });
    }
    const newProduct = {
      nombre,
      ImgUrl,
      cantidad,
      codigo,
      unidad,
      category,
    };
    await db.collection("products").add(newProduct);
    clearCache();

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const getProducts = async (req, res) => {
  try {
    // Verificar si los productos están en la caché
    if (productsCache.data) {
      return res.status(200).json(productsCache.data);
    }

    const productsSnapshotPromise = db.collection("products").get();

    const [productsSnapshot] = await Promise.all([productsSnapshotPromise]);

    const response = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
      ImgUrl: doc.data().ImgUrl,
      cantidad: doc.data().cantidad,
      codigo: doc.data().codigo,
      unidad: doc.data().unidad,
      category: doc.data().category,
    }));

    // Almacenar los productos en la caché
    productsCache.data = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const getProductsById = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Verificar si el producto está en la caché
    if (productsCache[productId]) {
      return res.status(200).json(productsCache[productId]);
    }

    const productsDocPromise = db.collection("products").doc(productId).get();

    const [productsDoc] = await Promise.all([productsDocPromise]);

    if (!productsDoc.exists) {
      return res.status(403).json("No product found with id");
    }

    const response = {
      id: productsDoc.id,
      nombre: productsDoc.data().nombre,
    };

    // Almacenar el producto en la caché
    productsCache[productId] = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const updateProductById = async (req, res) => {
  const { nombre, ImgUrl, cantidad, unidad, category } = req.body;

  try {
    const products = db.collection("products").doc(req.params.productId);
    const productId = await products.get();

    if (!productId.exists) {
      return res.status(404).json("No product found with id");
    }

    const UpdateProduct = {
      nombre,
      ImgUrl,
      cantidad,
      unidad,
      category,
    };

    await products.update(UpdateProduct);
    clearCache();
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const products = db.collection("products").doc(req.params.productId);
    const productId = await products.get();

    if (!productId.exists) {
      return res.status(404).json("No product found with id");
    }

    await products.delete();
    clearCache();
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { search } = req.params; // Obtener el término de búsqueda desde los parámetros de la URL

    // Verificar si la búsqueda está en la caché
    if (productSearchCache[search]) {
      return res.status(200).json(productSearchCache[search]);
    }

    let productsRef = db.collection("products");

    if (search) {
      productsRef = productsRef
        .where("nombre", ">=", search)
        .where("nombre", "<=", search + "\uf8ff");
    }

    const productsSnapshotPromise = productsRef.get();

    const [productsSnapshot] = await Promise.all([productsSnapshotPromise]);

    if (productsSnapshot.empty) {
      return res.status(404).json({ message: "No se encontraron productos." });
    }

    const response = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
      cantidad: doc.data().cantidad,
    }));

    // Almacenar el resultado de la búsqueda en la caché
    productSearchCache[search] = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
