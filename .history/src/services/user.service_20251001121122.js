import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const prisma = new PrismaClient();

/**
 * @description
 * Creates a new user in the database.
 * @param {object} userData - The user's data.
 * @returns {Promise<object>} The newly created user object without the password
 */

export const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * @description
 * Authenticates a user by email and password and returns a JWT on success.
 * @param {string} email - The user's email.
 * @param {string} password - The plain-text password.
 * @returns {Promise<object|null>} An object with the user and the JWT if successful, or null if authentication fails.
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) return null;
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refresh_token = jwt.sign(
    {
      userId: user.id,
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token, refresh_token };
};
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullname: true,
      role: true
    },
  });
};
