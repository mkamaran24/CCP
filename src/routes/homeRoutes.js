import express from "express";
import {
  renderViewHomePage,
  handleViewProfile,
  handleChangeLang,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/", renderViewHomePage);
router.post("/search", handleViewProfile);
router.get("/change-lang", handleChangeLang);

export default router;
