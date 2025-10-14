import * as userService from "../../services/user.service";
/**
 * @description
 * Retrieves a list of all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log("Error getting users", error);
    res.status(500).json({
      error: "An internal server error occured.",
    });
  }
};

/**
 * @description
 * Retires a single user by their ID.
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by Id:", error);
    res.status(500).json({
      error: "An internal server error has occured",
    });
  }
};

/**
 * @description
 * @param {query}
 * Retrieves a list of users
 */
export const queryUsers = async (req, res) => {
  const body = req.params;
  let size = body.size;
  const orderBy = body.orderBy;
  size = size ? Number(size) : size;
  try {
    const users = await userService.queryUsers(query, size, orderBy);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error Querying users:", error);
    res.status(500).json({
      error: "An internal server error occured",
    });
  }
};
