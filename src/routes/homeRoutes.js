import express from "express";
import {
  renderViewHomePage,
  handleViewProfile,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/", renderViewHomePage);
router.post("/search", handleViewProfile);

export default router;
