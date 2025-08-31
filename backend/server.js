const express = require("express");
const path = require("path");
const electionService = require("./services/electionService");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use("/", express.static(path.join(__dirname, "..", "frontend")));

// API: Add candidate
app.post("/api/addCandidate", (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ ok: false, msg: "id_or_name_missing" });
  const out = electionService.addCandidate(id, name);
  res.json(out);
});

// API: Cast vote
app.post("/api/vote", (req, res) => {
  const { voterId, candidateId } = req.body;
  if (!voterId || !candidateId) return res.status(400).json({ ok: false, msg: "voter_or_candidate_missing" });
  const out = electionService.vote(voterId, candidateId);
  res.json(out);
});

// API: List candidates
app.get("/api/candidates", (req, res) => {
  res.json(electionService.listCandidates());
});

// API: List votes
app.get("/api/votes", (req, res) => {
  res.json(electionService.listVotes());
});

// API: Show results
app.get("/api/results", (req, res) => {
  res.json(electionService.results());
});

// API: Reset
app.post("/api/reset", (req, res) => {
  res.json(electionService.reset());
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`👉 Frontend available at http://localhost:${PORT}/index.html`);
});
