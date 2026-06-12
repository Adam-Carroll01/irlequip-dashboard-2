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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.all("/trello/:path(*)", async (req, res) => {
  const trelloPath = req.params.path;

  // Merge query params + body into one params object (Trello accepts everything as query params)
  const params = new URLSearchParams({
    key: API_KEY,
    token: TOKEN,
    ...req.query,
    ...(["POST", "PUT"].includes(req.method) ? req.body : {}),
  });

  const url = `${BASE}/${trelloPath}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Irlequip Dashboard running on port ${PORT} ✅`));
