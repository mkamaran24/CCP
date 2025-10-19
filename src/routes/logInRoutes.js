import express from "express";
import { renderLogInPage } from "../controllers/logInController.js";

const router = express.Router();

router.get("/", renderLogInPage);

export default router;
