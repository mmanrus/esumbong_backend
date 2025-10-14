export const createConcern = async (req, res) => {
  const { title, details } = req.body;
  if (!details) {

  }
  const userId = req.user?.userId
  
  return res.status(409).json({
    error: "A unique field already exists.",
  });
};
