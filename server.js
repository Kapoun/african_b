import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg; // ✅ Destructure Pool from pg *before* using it

const app = express();
const port = 3000;

// === 🧠 DATABASE CONNECTION ===
// Use this for Railway (replace with your actual connection string if needed):
const pool = new Pool({
  connectionString: '8f1b4230-4c8b-4a61-9093-7cf8e8552a09',
  ssl: {
    rejectUnauthorized: false,
  },
});

// === 🧭 __dirname Fix for ES Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === 🧱 Middleware & Config ===
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// === 🛣️ Routes ===
app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));

app.post("/contact", (req, res) => {
  const { name, phone_number, message } = req.body;
  console.log("Contact form submitted:", { name, phone_number, message });
  res.send("Message received! We'll be in touch.");
});

app.get("/service", (req, res) => res.render("service"));
app.get("/register", (req, res) => res.render("register"));

app.post("/register", async (req, res) => {
  const { name, phone_number, branch } = req.body;

  try {
    const query = `
      INSERT INTO registrations (name, phone_number, branch)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, phone_number, branch];
    const result = await pool.query(query, values);

    console.log("Inserted:", result.rows[0]);
    res.redirect("/register");
  } catch (err) {
    console.error("Database insert error:", err);
    res.status(500).send("Oops! Something went wrong. Try again later.");
  }
});

// === 🚀 Start Server ===
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
