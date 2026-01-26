import serverless from "serverless-http";
import app from "../src/index.js"; // point to your actual Express app

export default serverless(app);
