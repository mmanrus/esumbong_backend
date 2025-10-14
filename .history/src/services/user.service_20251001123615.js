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

/**
 * @description
 * Retrieves all users from the database.
 * @returns {Promise<array>} An array of user objects without password
 */

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullname: true,
      role: true,
    },
  });

  return users;
};

/**
 * @description
 * Retrieves a single user from the database by ID.
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} The user object without the password.
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullname: true,
      role: true,
    },
  });
  return user;
};

/**
 * @description
 * Updates an existing user in the database.
 * @param {number} id - The user's ID.
 * @param {object} userData - The updated user's data.
 * @returns {Promise<object>} The updated user object without the password.
 */
export const updateUser = async (id, userData) => {
  const userToUpdate = { ...userData };
  if (userData.password) {
    userToUpdate.password = await bcrypt.hash(userData.password);
  }
  const updatedUser = await prisma.user.update({
    where: { id },
    data: userToUpdate,
  });
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const queryUsers = async (query, size = 20, orderBy = "asc") => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { fullname: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: size,
    orderBy: { name: orderBy },
  });
  return users;
};

/**
 * @description
 * Deletes a user from the database.
 * @param {number} id - The user's ID.
 * @returns {Promise<object>} The deleted user object.
 */
export const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};
