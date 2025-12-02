import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const { title, details, categoryId, other } = req.body;
  const files = req.files.map((file) => ({
    url: `/uploads/concerns/${file.filename}`,
    type: file.mimetype.startsWith("video") ? "video" : "photo",
  }));
  if (!categoryId && !other) {
    return res.status(400).json({
      message: "You must specify a category or provide an 'other' value."
    })  
  }
  if (categoryId && other) {
    return res.status(400).json({
      message: "You cannot set both a category and 'other'."
    })  
  }
  
  if (!details || !title) {
    return res.status(400).json({
      error: "Title and details fields are required",
    });
  }
  const userId = req.user?.userId;
  categoryId = parseInt(categoryId)
  try {
    await concernService.createConcern(
      { details, title, categoryId, other, files },
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
