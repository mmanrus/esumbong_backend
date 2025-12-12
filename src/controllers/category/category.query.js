import * as CategoryService from "../../services/category.service.js";

export const getAllCategoryController = async (req, res) => {
  console.log("Getting all categories")
  try {
    const allCategory = await CategoryService.getAllCategory();
    console.log("All categories to be sent:", allCategory);
    
    return res.status(200).json(allCategory);
  } catch (error) {
    console.error("Error upon getting all category data");
    return res
      .status(500)
      .json({ error: "An internal server error has occured" });
  }
};
