import * as feedbackService from "../../services/feedback.service.js";

export const createFeedback = async (req, res) => {
  const { title, details, } = req.body;
  const files = req.files.map((file) => ({
    url: `/uploads/feedback/${file.filename}`,
    type: file.mimetype.startsWith("video") ? "video" : "photo",
  }));
  
  if (!details || !title) {
    return res.status(400).json({
      error: "Title and Suggestion fields are required",
    });
  }
  const userId = req.user?.userId;
  try {
    await feedbackService.createFeedback(
      { details, title, files },
      parseInt(userId)
    );
    return res.status(200).json({
      message: "Your feedback has been filed.",
    });
  } catch (error) {
    console.error("Error creating ");
    return res.status(500).json({
      error: "An error occurred while filing the feedback.",
    });
  }
};
