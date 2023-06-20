import Joi from "joi";

const productModel = Joi.object({
  nombre: Joi.string().min(3).required(),
  ImgUrl: Joi.string().min(3),
  cantidad: Joi.number().min(1).required(),
  codigo: Joi.number().min(1).required(),
  unidad: Joi.string().min(1).required(),
  category: Joi.string().min(1).required(),
});

export default productModel;
