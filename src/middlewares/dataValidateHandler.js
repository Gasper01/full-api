import outputHandler from './outputHandler'

export default function dataValidateHandler (dataModel) {
  return function (req, res, next) {
    try {
      const { error } = dataModel.validate(req.body)
      if (error) {
        return res.send(outputHandler('400', 'Datos inválidos'))
      }
      next()
    } catch (error) {
      res.send(outputHandler('500'))
    }
  }
}
