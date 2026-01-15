import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const { title, details, categoryId, other } = req.body;
  console.log("Creating concern with data:", req.body)
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
  const id = parseInt(categoryId)
  try {
    await concernService.createConcern(
      { details, title, other, files },
      id,
      parseInt(userId)
    );
    return res.status(200).json({
      message: "Your concern has been filed.",
    });
  } catch (error) {
    console.error("Error creating Concern:", error);
    return res.status(500).json({
      error: "An error occurred while creating the concern.",
    });
  }
};

export const updateConcernStatus = async (req, res) => {
  const { concernId } = req.params
  const { status, updateMessage } = req.body
  const userId = req.user?.userId
  if (!status) {
    return res.status(400).json({
      error: "Status field is required."
    })
  }
  try {
    const updatedConcern = await concernService.updateStatusConcern(
      parseInt(userId),
      parseInt(concernId),
      { status, updateMessage }
    )
    return res.status(200).json({
      message: "Concern status has been updated."
    })

  } catch (error) {
    console.error("Error updating concern status: ", error)
    return res.status(500).json({
      error: "An error occurred upon updating the concern. "
    })
  }
}

export const validateConcern = async (req, res) => {
  const { id } = req.params;
  const { validation } = req.body
  const userId = req.user.id

  try {
    await concernService.validateConcern(parseInt(id), validation, parseInt(userId));
  } catch (error) {
    console.error("Error upon validating concern:", error)
    return res.status(500).json({
      error: "An internal server error has occurred.",
    })
  }
}