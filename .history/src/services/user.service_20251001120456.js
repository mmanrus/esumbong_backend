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
               password: hashedPassword
          }
     })

     const { password, ...userWithoutPassword} = user
     return userWithoutPassword
};
