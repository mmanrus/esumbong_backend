import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

const PORT = process.env.PORT || 3000;

app.use(cors()); // Use the cors middleware here
app.use(express.json());

app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("JWT_SECRET from env:", JWT_SECRET);
  console.log("Endpoints:");
});
