import Joi from 'joi'

const productModel = Joi.object({
  titulo: Joi.string().min(3).required()
})

export default productModel
