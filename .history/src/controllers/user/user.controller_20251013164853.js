import * as userService from "../../services/user.service.js";

/**
 * @description
 * Creates a new user.
 */
export const createUser = async (req, res) => {
  const { email, password, fullname, role, address, contactNumber } = req.body;
  if (!email || !password || !fullname||!address || !role || !contactNumber) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, fullname, username, and role",
    });
  }
  const type = role
  try {
    const newUser = await userService.createUser({
      email,
      password,
      fullname,
      type,
      address,
      contactNumber,
    });
    res.status(201).json(newUser);
  } catch (error) {
    // We've also updated this block to give a more specific error for unique constraints.
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target.includes("email")) {
        return res
          .status(409)
          .json({ error: "A user with this email already exists." });
      }
      return res.status(409).json({
        error: "A unique field already exists.",
      });
    }
    console.error("Error creating user:", error); // It's a good practice to log the error.
    res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await userService.loginUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    // Authentication successful, return the user details (without the password)
    res.status(200).json(user);
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { email, password, fullname, role } = req.body;

  try {
    const updateUser = await userService.updateUser(parseInt(id), {
      email,
      password,
      fullname,
      username,
      role,
    });
    res.status(200).json(updateUser);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        errror: "User not found.",
      });
    }
    res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
};

/**
 * @description
 * Deletes a user from the database.
 */
export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    await userService.deleteUser(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found.",
      });
    }
    res.status(500).json({
      error: "An internal server error occured",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is missing" });
    }
    const payload = await userService.refreshAccessToken();
    res.status(200).json(payload);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: "An internal server error occured",
    });
  }
};
