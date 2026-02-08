import * as feedbackService from "../../services/feedback.service.js";

export const createFeedback = async (req, res) => {
  const { title, feedback, media= [] } = req.body;

  if (!title || !feedback) {
    return res.status(400).json({
      error: "Title and Feedback fields are required",
    });
  }
  const userId = req.user?.userId;
  try {
    await feedbackService.createFeedback(
      { title, feedback, media },
      parseInt(userId)
    );
    return res.status(201).json({
      message: "Your feedback has been filed.",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating feedback:", error);
    }
    return res.status(500).json({
      error: "An error occurred while filing the feedback.",
    });
  }
};
