import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const { title, details } = req.body;
  if (!details || !title) {
    return res.status(400).json({
      error: "Title and details fields are required",
    });
  }
  const userId = req.user?.userId;

  try {
    const newConcern = await concernService.createConcern(
      { details, title },
      parseInt(userId)
    );
  } catch (error) {
    console.error("Error creating ");
    return res.status(500).json({
      error: "Title and details fields are required",
    });
  }
};
