import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { registerRoutes } from "./routes/routes.js";
import { errorHandler } from "./middleware/error-handler-middlware.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT ;
const clientURL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors ({
    origin: clientURL,
    credentials: true
  })
)
app.all("/api/auth/{*splat}", toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());


registerRoutes(app);

app.use(errorHandler);


app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.listen(PORT, () => {
  console.log("Server is running on port 8081");
});
