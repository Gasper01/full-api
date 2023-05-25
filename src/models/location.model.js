import Joi from 'joi';

const locationModel = Joi.object({
  locationName: Joi.string().min(3).required(),
  accountNumber: Joi.string().min(1).required(),
  idDestination: Joi.string().min(3).required(),
});

export default locationModel;
