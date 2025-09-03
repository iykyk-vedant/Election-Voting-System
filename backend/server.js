const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const supabase = require("./config/supabase");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("../frontend"));

// Endpoints for candidates
app.post("/api/candidates", async (req, res) => {
  const { name, party } = req.body;
  const { data, error } = await supabase
    .from('candidates')
    .insert([{ name, party }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, data });
});

app.get("/api/candidates", async (req, res) => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Endpoints for votes
app.post("/api/votes", async (req, res) => {
  const { voter_id, candidate_id } = req.body;
  const { data, error } = await supabase
    .from('votes')
    .insert([{ voter_id, candidate_id }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, data });
});

app.get("/api/results", async (req, res) => {
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id,
      name,
      party,
      votes:votes(count)
    `);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
