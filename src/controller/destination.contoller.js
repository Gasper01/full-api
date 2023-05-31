import db from '../db/config.connection';

export const createDestinations = async (req, res) => {
  const { destinationName } = req.body;

  try {
    const destinationNameExists = await db
      .collection('destinations')
      .where('destinationName', '==', destinationName)
      .limit(1)
      .get();

    if (!destinationNameExists.empty) {
      // Si el usuario ya existe, devolver un error
      return res.status(400).json({ message: 'Destinations already exists' });
    }

    const newDestination = {
      destinationName,
    };
    await db.collection('destinations').add(newDestination);
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
export const getDestinations = async (req, res) => {
  try {
    const destinations = await db.collection('destinations').get();
    const response = destinations.docs.map((doc) => ({
      id: doc.id,
      destinationName: doc.data().destinationName,
    }));
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const getLocationByDestination = async (req, res) => {
  try {
    const destinationSnapshot = await db
      .collection('destinations')
      .where('destinationName', '==', req.params.search)
      .get();
    if (!destinationSnapshot.empty) {
      const destinationDoc = destinationSnapshot.docs[0];
      const destinationId = destinationDoc.id;

      const locationSnapshot = await db
        .collection('locations')
        .where('idDestination', '==', destinationId)
        .get();

      if (!locationSnapshot.empty) {
        const response = locationSnapshot.docs.map((doc) => ({
          id: doc.id,
          locationName: doc.data().locationName,
          accountNumber: doc.data().accountNumber,
        }));

        return res.status(200).json(response);
      } else {
        return res.status(403).json({
          message: 'No se encontró la ubicación correspondiente al destino.',
        });
      }
    } else {
      return res.status(403).json({
        message: 'No se encontró el destino con el nombre especificado.',
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
