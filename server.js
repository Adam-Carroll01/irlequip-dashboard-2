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

// Image proxy — fetches Trello attachment images server-side so
// colleagues don't need to be logged in to Trello to see them
app.get("/img-proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing url");

  // Only allow Trello domains
  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send("Invalid url"); }
  const allowed = ["trello.com", "trellocdn.com", "attachments.trellocdn.com"];
  if (!allowed.some(d => parsed.hostname.endsWith(d))) {
    return res.status(403).send("Forbidden domain");
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `OAuth oauth_consumer_key="${API_KEY}", oauth_token="${TOKEN}"`,
      },
    });
    if (!response.ok) return res.status(response.status).send("Upstream error");

    const ct = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buf = await response.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.all("/trello/:path(*)", async (req, res) => {
  const trelloPath = req.params.path;
  const qp = new URLSearchParams({ key: API_KEY, token: TOKEN, ...req.query });
  const url = `${BASE}/${trelloPath}?${qp.toString()}`;
  const isWrite = ["POST", "PUT"].includes(req.method);
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: isWrite && Object.keys(req.body || {}).length ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Irlequip Dashboard running on port ${PORT} ✅`));
