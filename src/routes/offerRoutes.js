import express from "express";
import {
  renderViewOfferPage,
  handleDeleteOffer,
} from "../controllers/offerController.js";

const router = express.Router();

router.get("/view", renderViewOfferPage);
router.post("/delete", handleDeleteOffer);

export default router;
