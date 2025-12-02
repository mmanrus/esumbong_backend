import * as CategoryService from "../../services/category.service.js";

export const getAllCategoryController = async () => {
  try {
    const allCategory = await CategoryService.getAllCategory();
    return res.status(200).json(allCategory);
  } catch (error) {
    console.error("Error upon getting all category data");
    return res
      .status(500)
      .json({ error: "An internal server error has occured" });
  }
};
