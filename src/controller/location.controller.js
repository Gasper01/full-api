import db from "../db/config.connection";

export const createLocations = async (req, res) => {
  const { locationName, accountNumber, idDestination } = req.body;

  try {
    const newLocation = {
      locationName,
      accountNumber,
      idDestination,
    };
    await db.collection("locations").add(newLocation);
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An unexpected error occurred on the server" });
  }
};
