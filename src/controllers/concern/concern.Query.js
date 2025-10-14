import * as concernService from "../../services/concern.service.js";

export const getConcernById = async (req, res) => {
  const { id } = req.params;
  if (!concernId || isNan(concernId)) {
    return res.status(400).json({ error: "Invalid or missisng concern id" });
  }
  try {
    const concern = await concernService.getConcernById(concernId);
    if (!concern) {
      return res.status(404).json({ error: "Concern not found" });
    }
    return res.status(200).json(concern);
  } catch (error) {
    console.error("Error getting concern");
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the concern." });
  }
};
