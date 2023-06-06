export default function dataValidateHandler(dataModel) {
  return function (req, res, next) {
    try {
      const { error } = dataModel.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Datos inválidos' });
      }
      next();
    } catch (error) {
      res.status(500).json(error);
    }
  };
}
