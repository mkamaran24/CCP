// app.js (Main Server File)
import express from "express";
// import { connectToLdap } from "./services/ldapService.js";
import expressLayouts from "express-ejs-layouts";
import bodyParser from "body-parser"; // Note: body-parser is redundant since express.urlencoded is used
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import offerRoutes from "./routes/offerRoutes.js";
import freeUnitRoutes from "./routes/freeUnitRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import logInRoutes from "./routes/logInRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Standard Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Session Setup ---
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    },
  })
);

// --- NEW: Authentication Middleware ---
const checkAuth = (req, res, next) => {
  // If the session has the 'isAuthenticated' flag set, continue
  if (req.session.isAuthenticated) {
    return next();
  }
  // Otherwise, redirect to the login page
  res.redirect("/login");
};

// --- LDAP Login POST Endpoint (Updated to use session) ---
app.post("/ldap-login", async (req, res) => {
  const { username, password } = req.body; // In a real app, you might want to sanitize the username before passing it to LDAP
  var isAuthenticated = false;
  // const isAuthenticated = await connectToLdap(username, password);

  if (username == "root" && password == "123") {
    isAuthenticated = true;
  }

  if (isAuthenticated) {
    // ⭐ SUCCESS: Set session flag and redirect
    req.session.isAuthenticated = true;
    req.session.username = username; // Store username in session
    console.log(`User ${username} logged in.`);
    // Redirect to the home page or a protected area
    return res.json({ success: true, redirect: "/" });
  } else {
    // ❌ FAILURE
    console.log(`Login failed for user ${username}.`);
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
});

// --- View/Static Middleware ---
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// --- Route Definitions ---

// 1. PUBLIC ROUTES (Login, Logout)
app.use("/login", logInRoutes);

// Optional: Add a simple logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect("/login");
  });
});

// 2. PROTECTED ROUTES (Apply checkAuth middleware to all these routes)
app.use(checkAuth); // <-- ALL routes defined AFTER this line are protected
app.use("/", homeRoutes);
app.use("/offers", offerRoutes);
app.use("/free-units", freeUnitRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
