import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const { title, details, category } = req.body;
  if (!details || !title) {
    return res.status(400).json({
      error: "Title and details fields are required",
    });
  }
  const userId = req.user?.userId;

  try {
    await concernService.createConcern(
      { details, title, category },
      parseInt(userId)
    );
    return res.status(200).json({
      message: "Your concern has been filed.",
    });
  } catch (error) {
    console.error("Error creating ");
    return res.status(500).json({
      error: "An error occurred while creating the concern.",
    });
  }
};
