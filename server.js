import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "d14ca594a23f93e4d620e60eaeeceaca";
const TOKEN = "ATTA276c5a6a510c336a1d907be9787e9eb88b17e60f8b43cd65d2b2040399c80bcb8B7D103B";
const BASE = "https://api.trello.com/1";

// Serve the dashboard HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Proxy all Trello API calls — note the (*)  wildcard syntax for Express 4
app.all("/trello/:path(*)", async (req, res) => {
  const trelloPath = req.params.path;
  const query = new URLSearchParams(req.query).toString();
  const url = `${BASE}/${trelloPath}?key=${API_KEY}&token=${TOKEN}${query ? "&" + query : ""}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["POST", "PUT"].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Irlequip Dashboard running on port ${PORT} ✅`));
