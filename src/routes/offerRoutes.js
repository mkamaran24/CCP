import express from "express";
import {
  renderViewOfferPage,
  handleDeleteOffer,
  handleAddOffer,
} from "../controllers/offerController.js";

const router = express.Router();

router.get("/view", renderViewOfferPage);
router.post("/add", handleAddOffer);
router.post("/delete", handleDeleteOffer);

export default router;
