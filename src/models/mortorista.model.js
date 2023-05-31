import Joi from 'joi';

const motoristaModel = Joi.object({
  motoristaName: Joi.string().min(3).required(),
  placa: Joi.string().min(3).required(),
  cars: Joi.string().min(3).required(),
});

export default motoristaModel;
