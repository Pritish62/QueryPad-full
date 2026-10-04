import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ;


app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
