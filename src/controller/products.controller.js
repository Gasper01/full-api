import db from '../db/config.connection'
import outputHandler from '../middlewares/outputHandler'

export const createProduct = async (req, res) => {
  const { titulo } = req.body
  try {
    const newProduct = {
      titulo
    }
    await db.collection('products').add(newProduct)
    return res.send(outputHandler('200', 'ok'))
  } catch (error) {
    return res.rend(outputHandler('500'))
  }
}

export const getProducts = async (req, res) => {
  try {
    const products = await db.collection('products').get()
    const response = products.docs.map((doc) => ({
      id: doc.id,
      titulo: doc.data().titulo
    }))
    return res.send(outputHandler('200', response))
  } catch (error) {
    return res.send(outputHandler('500'))
  }
}

export const getProductsById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId)
    const productsDoc = await products.get()

    if (!productsDoc.exists) {
      return res.send(outputHandler('404', 'No product found with id '))
    }

    const response = {
      id: productsDoc.id,
      titulo: productsDoc.data().titulo
    }

    return res.send(outputHandler('200', response))
  } catch (error) {
    return res.send(outputHandler('500'))
  }
}

export const updateProductById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId)
    const productId = await products.get()

    if (!productId.exists) {
      return res.send(outputHandler('404', 'No product found with id '))
    }

    const titulo = req.body

    await products.update(titulo)

    return res.send(outputHandler('200', 'ok'))
  } catch (error) {
    return res.send(outputHandler('500'))
  }
}

export const deleteProductById = async (req, res) => {
  try {
    const products = db.collection('products').doc(req.params.productId)
    const productId = await products.get()

    if (!productId.exists) {
      return res.send(outputHandler('404', 'No product found with id '))
    }

    await products.delete()

    return res.send(outputHandler('200', 'ok'))
  } catch (error) {
    return res.send(outputHandler('500'))
  }
}
