import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { registerRoutes } from "./routes/routes.js";
import { errorHandler } from "./middleware/error-handler-middlware.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/index.js";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8081);
const configuredClientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const clientOrigins = new Set(configuredClientOrigins);

if (process.env.NODE_ENV !== "production") {
  clientOrigins.add("http://localhost:3000");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.has(origin.replace(/\/$/, ""))) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.all("/api/auth/{*splat}", toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));

registerRoutes(app);

app.use(errorHandler);


app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
