import dotenv from 'dotenv';
dotenv.config();


const app = express()

const JWT_SECRET = process.env.JWT_SECRET;