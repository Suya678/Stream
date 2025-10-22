import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route";

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
