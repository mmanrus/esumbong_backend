import * as userService from "../services/user.service";

export const createUser = async (req, res) => {
  const { email, password, fullname, role } = req.body;
  if (!email || !password || !fullname || !username || !role) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, fullname, username, and role",
    });
  }

  try {
     const newUser = await userService.createUser({
          email,
          password,
          fullname,
          role
     })
     res.status(201).json(newUser)
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
