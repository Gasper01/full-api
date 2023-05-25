import Joi from 'joi';

const destinationsModel = Joi.object({
  destinationName: Joi.string().min(3).required(),
});

export default destinationsModel;
