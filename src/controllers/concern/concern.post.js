import * as concernService from "../../services/concern.service.js";

export const createConcern = async (req, res) => {
  const {
    title,
    details,
    needsBarangayAssistance,
    categoryId,
    other,
    media
  } = req.body;


  /* ───────────── Validation ───────────── */
  if (!title || !details) {
    return res.status(400).json({
      error: "Title and details fields are required",
    });
  }

  if (!categoryId && !other) {
    return res.status(400).json({
      message: "You must specify a category or provide an 'other' value.",
    });
  }

  if (categoryId && other) {
    return res.status(400).json({
      message: "You cannot set both a category and 'other'.",
    });
  }

  /* ───────────── Normalize values ───────────── */
  const userId = Number(req.user?.userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsedCategoryId = categoryId ? Number(categoryId) : null;

  /* ───────────── Create concern ───────────── */
  try {
    await concernService.createConcern(
      {
        title,
        details,
        needsBarangayAssistance: Boolean(needsBarangayAssistance),
        other: other || null,
        media, // ✅ metadata array
      },
      parsedCategoryId,
      userId,
    );

    return res.status(200).json({
      message: "Your concern has been filed.",
    });
  } catch (error) {
    console.error("Error creating concern:", error);
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
    await concernService.updateStatusConcern(
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
  const userId = req.user?.userId

  try {
    await concernService.validateConcern(parseInt(id), validation, parseInt(userId));
  } catch (error) {
    console.error("Error upon validating concern:", error)
    return res.status(500).json({
      error: "An internal server error has occurred.",
    })
  }
}

export const archiveConcern = async (req, res) => {
  const { id } = req.params
  const userId = req.user?.userId
  try {
    await concernService.archiveConcern(parseInt(id), parseInt(userId))

    return res.status(200).json({ message: "Successfully archived the concern" })
  } catch (error) {
    console.error("Error upon archiving the concern", error)
    return res.status(500).json({
      error: "An internal server error has occured while archiving concern"
    })
  }
}

export const deleteConcern = async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId
  try {
    await concernService.deleteConcern(parseInt(id), parseInt(userId))
  } catch (error) {
    console.error("Error upon deleting concern:", error)
    return res.status(500).json({
      error: "An internal server error has occured while deleting Concern"
    })
  }
}