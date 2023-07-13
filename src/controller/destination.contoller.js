import db from "../db/config.connection";

import {
  destinationsCache,
  cachedDestinations,
  clearCacheDestination,
  locationCache,
  locationCache2,
} from "../cache/cache";

export const createDestinations = async (req, res) => {
  const { destinationName } = req.body;

  try {
    if (!destinationName) {
      return res.status(400).json({ message: "Missing destination name" });
    }

    const destinationNameExistsPromise = db
      .collection("destinations")
      .where("destinationName", "==", destinationName)
      .limit(1)
      .get();

    const [destinationNameExistsSnapshot] = await Promise.all([
      destinationNameExistsPromise,
    ]);
    if (!destinationNameExistsSnapshot.empty) {
      return res.status(400).json({ message: "Destination already exists" });
    }

    const newDestination = {
      destinationName,
    };

    await db.collection("destinations").add(newDestination);
    clearCacheDestination();
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { destinationName } = req.body;
  try {
    const destinationRef = db.collection("destinations").doc(id);
    const destinationDoc = await destinationRef.get();

    if (!destinationDoc.exists) {
      return res.status(404).json({ message: "destination not found" });
    }

    await destinationRef.update({ destinationName });
    clearCacheDestination();

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
export const getDestinations = async (req, res) => {
  try {
    if (cachedDestinations.data) {
      // Si los destinos están en la caché, devolver la respuesta de la caché
      return res.status(200).json(cachedDestinations.data);
    }
    const destinationsPromise = db.collection("destinations").get();

    const [destinationsSnapshot] = await Promise.all([destinationsPromise]);

    const response = destinationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      destinationName: doc.data().destinationName,
    }));

    //Almacenar los destinos en la caché
    cachedDestinations.data = response;

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
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
      .collection("destinations")
      .where("destinationName", "==", destinationName)
      .get();

    const [destinationSnapshot] = await Promise.all([
      destinationSnapshotPromise,
    ]);

    if (!destinationSnapshot.empty) {
      const destinationDoc = destinationSnapshot.docs[0];
      const destinationId = destinationDoc.id;

      const locationSnapshotPromise = db
        .collection("locations")
        .where("idDestination", "==", destinationId)
        .get();

      const [locationSnapshot] = await Promise.all([locationSnapshotPromise]);

      if (!locationSnapshot.empty) {
        const response = locationSnapshot.docs.map((doc) => ({
          id: doc.id,
          idDestination: doc.data().idDestination,
          locationName: doc.data().locationName,
          accountNumber: doc.data().accountNumber,
        }));

        // Almacenar el destino y las ubicaciones en la caché
        destinationsCache[destinationName] = destinationId;
        locationCache[destinationId] = response;

        return res.status(200).json(response);
      } else {
        return res.status(403).json({
          message: "No se encontró la ubicación correspondiente al destino.",
        });
      }
    } else {
      return res.status(403).json({
        message: "No se encontró el destino con el nombre especificado.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const locationId = req.params.locationId;

    // Verificar si las ubicaciones están en la caché
    if (locationCache2[locationId]) {
      return res.status(200).json(locationCache2[locationId]);
    }

    const locationSnapshotPromise = db
      .collection("locations")
      .where("idDestination", "==", locationId)
      .get();

    const [locationSnapshot] = await Promise.all([locationSnapshotPromise]);

    if (!locationSnapshot.empty) {
      const response = locationSnapshot.docs.map((doc) => ({
        id: doc.id,
        idDestination: doc.data().idDestination,
        locationName: doc.data().locationName,
        accountNumber: doc.data().accountNumber,
      }));

      // Almacenar el destino y las ubicaciones en la caché
      locationCache2[locationId] = response;

      return res.status(200).json(response);
    } else {
      return res.status(403).json({
        message: "No se encontró la ubicación correspondiente al destino.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
