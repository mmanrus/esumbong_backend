import "dotenv/config"
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

import { neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

console.log("DATABASE_URL_NEON from prisma.js:", process.env.DATABASE_URL_NEON);

const connectionString = process.env.DATABASE_URL_NEON

const adapter = new PrismaNeon({ connectionString });
const prisma = global.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV === 'development') global.prisma = prisma;
export default prisma;