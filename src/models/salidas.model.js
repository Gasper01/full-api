import Joi from 'joi';

const salidasModel = Joi.object({
  Datesalidas: Joi.string().required(),
  destindation: Joi.string().min(1).required(),
  motorista: Joi.string().min(3).required(),
  userid: Joi.string().min(3).required(),
  productos: Joi.array().items(
    Joi.object({
      idProd: Joi.number().integer().min(1).required(),
      nombre: Joi.string().required(),
      cantidad: Joi.string(),
      location: Joi.string(),
    })
  ),
});

export default salidasModel;
