import { Router } from 'express'
import * as use from '../controller/products.controller'
import dataValidateHandler from '../middlewares/dataValidateHandler'
import productModel from '../models/product.model'
import { verifyToken } from '../middlewares/verifyJwt'
import { verifyRoles } from '../middlewares/verifyRoles'

const router = Router()
router.get('/', use.getProducts)
router.get('/:productId', use.getProductsById)
router.delete('/:productId', verifyToken, verifyRoles, use.deleteProductById)
router.post('/', verifyToken, verifyRoles, dataValidateHandler(productModel), use.createProduct)
router.put('/:productId', verifyToken, verifyRoles, dataValidateHandler(productModel), use.updateProductById)

export default router
