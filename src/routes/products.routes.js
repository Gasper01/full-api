import { Router } from 'express';
import * as use from '../controller/products.controller';
import dataValidateHandler from '../middlewares/dataValidateHandler';
import productModel from '../models/product.model';
import { verifyToken } from '../middlewares/verifyJwt';

const router = Router();
router.get('/', use.getProducts);
router.get('/search/:search', use.searchProduct);
router.get('/:productId', use.getProductsById);
router.delete('/:productId', verifyToken, use.deleteProductById);
router.post(
  '/',
  verifyToken,
  dataValidateHandler(productModel),
  use.createProduct
);
router.put(
  '/:productId',
  verifyToken,
  dataValidateHandler(productModel),
  use.updateProductById
);

export default router;
