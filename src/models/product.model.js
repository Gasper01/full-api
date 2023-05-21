import Joi from 'joi'

const productModel = Joi.object({
  producto: Joi.string().min(3).required(),
  cantidad: Joi.string().min(1).required(),
  codigo: Joi.string().min(1).required(),
  unidad:Joi.string().min(1).required()
})

export default productModel
