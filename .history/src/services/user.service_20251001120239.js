import { PrismaClient } from "@prisma/client"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

const prisma = new PrismaClient()

