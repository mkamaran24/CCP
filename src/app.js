import express from "express";
import expressLayouts from "express-ejs-layouts";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import offerRoutes from "./routes/offerRoutes.js";
import freeUnitRoutes from "./routes/freeUnitRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Optional, but good practice for handling JSON payloads as well

// A secret key is required to sign the session ID cookie.
// Set a strong, unique secret and store it securely (e.g., in a .env file).
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(
  session({
    secret: SESSION_SECRET, // Required: Used to sign the session ID cookie
    resave: false, // Recommended: Don't save session if unmodified
    saveUninitialized: false, // Recommended: Don't create session until something is stored
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use("/", homeRoutes);
app.use("/offers", offerRoutes);
app.use("/free-units", freeUnitRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
