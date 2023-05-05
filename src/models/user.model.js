import Joi from 'joi'
import bcrypt from 'bcryptjs'

const userModel = {
  userModel: Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().min(3).required(),
    password: Joi.string().min(3).required()
  }),

  hashPassword: (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  },
  comparePassword: (password, resivedpassword) => {
    return bcrypt.compare(password, resivedpassword)
  }
}

export default userModel
