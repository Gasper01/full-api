import db from '../db/config.connection';

let cachedDestinations = null;

let destinationsCache = {};
let locationCache = {};

export const createDestinations = async (req, res) => {
  const { destinationName } = req.body;

  try {
    if (!destinationName) {
      return res.status(400).json({ message: 'Missing destination name' });
    }

    const destinationNameExistsPromise = db
      .collection('destinations')
      .where('destinationName', '==', destinationName)
      .limit(1)
      .get();

    const [destinationNameExistsSnapshot] = await Promise.all([
      destinationNameExistsPromise,
    ]);
    if (!destinationNameExistsSnapshot.empty) {
      return res.status(400).json({ message: 'Destination already exists' });
    }

    const newDestination = {
      destinationName,
    };

    await db.collection('destinations').add(newDestination);
    cachedDestinations = null;
    return res.status(200).json('ok');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const getDestinations = async (req, res) => {
  try {
    if (cachedDestinations) {
      // Si los destinos están en la caché, devolver la respuesta de la caché
      return res.status(200).json(cachedDestinations);
    }
    const destinationsPromise = db.collection('destinations').get();

    const [destinationsSnapshot] = await Promise.all([destinationsPromise]);

    const response = destinationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      destinationName: doc.data().destinationName,
    }));

    // Almacenar los destinos en la caché
    cachedDestinations = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};

export const getLocationByDestination = async (req, res) => {
  try {
    const destinationName = req.params.search;

    // Verificar si el destino está en la caché
    if (destinationsCache[destinationName]) {
      const destinationId = destinationsCache[destinationName];

      // Verificar si las ubicaciones están en la caché
      if (locationCache[destinationId]) {
        return res.status(200).json(locationCache[destinationId]);
      }
    }

    const destinationSnapshotPromise = db
      .collection('destinations')
      .where('destinationName', '==', destinationName)
      .get();

    const [destinationSnapshot] = await Promise.all([
      destinationSnapshotPromise,
    ]);

    if (!destinationSnapshot.empty) {
      const destinationDoc = destinationSnapshot.docs[0];
      const destinationId = destinationDoc.id;

      const locationSnapshotPromise = db
        .collection('locations')
        .where('idDestination', '==', destinationId)
        .get();

      const [locationSnapshot] = await Promise.all([locationSnapshotPromise]);

      if (!locationSnapshot.empty) {
        const response = locationSnapshot.docs.map((doc) => ({
          id: doc.id,
          locationName: doc.data().locationName,
          accountNumber: doc.data().accountNumber,
        }));

        // Almacenar el destino y las ubicaciones en la caché
        destinationsCache[destinationName] = destinationId;
        locationCache[destinationId] = response;

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
    return res
      .status(500)
      .json({ message: 'An unexpected error occurred on the server' });
  }
};
