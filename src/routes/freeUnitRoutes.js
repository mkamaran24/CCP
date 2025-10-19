import express from "express";
import {
  renderViewFreeUnitPage,
  handleDeleteFreeUnit,
} from "../controllers/freeUnitController.js";

const router = express.Router();

router.get("/view", renderViewFreeUnitPage);
router.post("/delete", handleDeleteFreeUnit);

export default router;
