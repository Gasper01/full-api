import Joi from 'joi';

const productModel = Joi.object({
  nombre: Joi.string().min(3).required(),
  cantidad: Joi.number().min(1).required(),
  codigo: Joi.number().min(1).required(),
  unidad: Joi.string().min(1).required(),
});

export default productModel;
