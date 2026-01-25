import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon";

import { neonConfig } from '@neondatabase/serverless';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

console.log("DATABASE_URL_NEON from prisma.js:", process.env.DATABASE_URL_NEON);

const connectionString = process.env.DATABASE_URL_NEON

const adapter = new PrismaNeon({ connectionString });
const prisma = global.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV === 'development') global.prisma = prisma;
export default prisma;