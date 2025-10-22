import express from "express";
import {
  renderLogInPage,
  testLdapServer,
} from "../controllers/logInController.js";

const router = express.Router();

router.get("/", renderLogInPage);

router.get("/test-ldap", testLdapServer);

export default router;
