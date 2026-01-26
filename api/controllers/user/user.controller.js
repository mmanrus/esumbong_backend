import * as userService from "../../services/user.service.js";

/**
 * @description
 * Creates a new user.
 */
export const createUser = async (req, res) => {
  const { email, password, fullname, type, address, contactNumber } = req.body;
  if (!email || !password || !fullname || !address || !type || !contactNumber) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, fullname, username, and type",
    });
  }
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
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error logging in user:", error);
    if (error.message === "You are restricted from using this account.") {
      return res.status(403).json({ error: error.message })
    }
    if (error.message === "Incorrect password.") {
      return res.status(401).json({ error: error.message })
    }
    if (error.message === "User not found.") {
      return res.status(404).json({ error: error.message })
    }
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};
export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const updateData = {};
  const { email, contactNumber, password, fullname, role } = req.body;

  if (email) updateData.email = email;
  if (contactNumber) updateData.contactNumber = contactNumber;
  if (fullname) updateData.fullname = fullname;
  if (role) updateData.role = role;
  if (password && password.trim() !== "") updateData.password = password;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No fields provided to update." });
  }

  try {
    const updatedUser = await userService.updateUser(parseInt(id), updateData);
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser, // optional, send updated user back
    });
  } catch (error) {
    console.error("Error message", error);
    console.error("Error.message", error.message)
    if (error.message === "Email already taken.") {
      return res.status(400).json({ error: "Email already taken." });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * @description
 * Deletes a user from the database.
 */
export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    await userService.toggleUserActive(parseInt(id));
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
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      error: "An internal server error occured",
    });
  }
};

export const updateUser = async (req, res) => {
  const { email, password, role, fullname } = req.body
  const { id } = req.params

  try {
    await userService.updateUser(parseInt(id), {
      email,
      password,
      role,
      fullname
    })
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      error: "An internal server error occured",
    });
  }
}