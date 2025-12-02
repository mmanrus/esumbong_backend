import * as CategoryService from "../../services/category.service.js";

export const getAllCategory = async () => {
  try {
    return await CategoryService.getAllCategory();
  } catch (error) {
    console.error("Error upon getting all category data");
    return res
      .status(500)
      .json({ error: "An internal server error has occured" });
  }
};
