import express from "express";
import {
  renderViewHomePage,
  handleViewProfile,
  handleChangeLang,
  handleUpdateMainBalance,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/", renderViewHomePage);
router.post("/search", handleViewProfile);
router.get("/change-lang", handleChangeLang);
router.post("/update-mbalance", handleUpdateMainBalance);

export default router;
