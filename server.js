const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const supabase = require("./backend/config/supabase");
const electionService = require("./backend/services/electionService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Serve the frontend app for any route that's not an API call
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// API routes
// Hybrid approach - use both C program and Supabase
// C program for core logic, Supabase for persistent storage

// Endpoint to add a candidate
app.post("/api/candidates", async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ ok: false, msg: "ID and name are required" });
    }
    
    // Add to C program
    const cResult = await electionService.addCandidate(id, name);
    
    // Also add to Supabase for persistent storage
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ id, name }]);
    
    if (error) {
      console.error('Supabase error:', error);
      // If Supabase fails, we still return the C program result
      return res.json(cResult);
    }
    
    res.json(cResult);
  } catch (error) {
    console.error("Error in /api/candidates POST:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// Endpoint to get all candidates
app.get("/api/candidates", async (req, res) => {
  try {
    // Try to get from Supabase first for persistent data
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('candidates')
      .select('*')
      .order('id');
    
    if (!supabaseError && supabaseData) {
      // Transform Supabase data to match expected format
      const candidatesWithVotes = await Promise.all(supabaseData.map(async (candidate) => {
        // Get vote count for this candidate
        const { count, error } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id);
        
        return {
          id: candidate.id,
          name: candidate.name,
          votes: count || 0
        };
      }));
      
      return res.json(candidatesWithVotes);
    }
    
    // Fallback to C program if Supabase fails
    console.log("Fetching candidates from C program...");
    const result = await electionService.listCandidates();
    console.log("Candidates result:", result);
    // Check if result is an object with candidates property or just the candidates array
    if (result && result.candidates) {
      res.json(result.candidates);
    } else if (Array.isArray(result)) {
      res.json(result);
    } else {
      res.status(500).json({ ok: false, msg: "Invalid response format" });
    }
  } catch (error) {
    console.error("Error in /api/candidates GET:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// Endpoint to cast a vote
app.post("/api/votes", async (req, res) => {
  try {
    const { voterId, candidateId } = req.body;
    if (!voterId || !candidateId) {
      return res.status(400).json({ ok: false, msg: "Voter ID and Candidate ID are required" });
    }
    
    // Cast vote in C program
    const cResult = await electionService.vote(voterId, candidateId);
    
    // Also record in Supabase for persistent storage
    if (cResult.ok) {
      const { data, error } = await supabase
        .from('votes')
        .insert([{ voter_id: voterId, candidate_id: candidateId }]);
      
      if (error) {
        console.error('Supabase error:', error);
      }
    }
    
    res.json(cResult);
  } catch (error) {
    console.error("Error in /api/votes POST:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// Endpoint to get all votes
app.get("/api/votes", async (req, res) => {
  try {
    // Get votes from Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('votes')
      .select('*')
      .order('id');
    
    if (!supabaseError && supabaseData) {
      return res.json(supabaseData);
    }
    
    // Fallback to C program if Supabase fails
    console.log("Fetching votes from C program...");
    const result = await electionService.listVotes();
    console.log("Votes result:", result);
    // Check if result is an object with votes property or just the votes array
    if (result && result.votes) {
      res.json(result.votes);
    } else if (Array.isArray(result)) {
      res.json(result);
    } else {
      res.status(500).json({ ok: false, msg: "Invalid response format" });
    }
  } catch (error) {
    console.error("Error in /api/votes GET:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// Endpoint to get election results
app.get("/api/results", async (req, res) => {
  try {
    // Get candidates from Supabase with vote counts
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('id');
    
    if (!candidatesError && candidates) {
      // Get vote counts for each candidate
      const candidatesWithVotes = await Promise.all(candidates.map(async (candidate) => {
        const { count, error } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id);
        
        return {
          id: candidate.id,
          name: candidate.name,
          votes: [{ count: count || 0 }]
        };
      }));
      
      return res.json(candidatesWithVotes);
    }
    
    // Fallback to C program if Supabase fails
    console.log("Fetching results from C program...");
    const result = await electionService.results();
    console.log("Results result:", result);
    // Check if result is an object with candidates property
    if (result && result.candidates) {
      // Transform the result to match the expected format
      const transformed = result.candidates.map(candidate => ({
        ...candidate,
        votes: [{ count: candidate.votes }]
      }));
      res.json(transformed);
    } else if (Array.isArray(result)) {
      // If it's already an array, transform each item
      const transformed = result.map(candidate => ({
        ...candidate,
        votes: [{ count: candidate.votes }]
      }));
      res.json(transformed);
    } else {
      res.status(500).json({ ok: false, msg: "Invalid response format" });
    }
  } catch (error) {
    console.error("Error in /api/results GET:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

// Endpoint to reset the election
app.post("/api/reset", async (req, res) => {
  try {
    // Reset C program
    const cResult = await electionService.reset();
    
    // Also reset Supabase tables
    if (cResult.ok) {
      await supabase.from('candidates').delete().neq('id', 0); // Delete all
      await supabase.from('votes').delete().neq('id', 0); // Delete all
    }
    
    res.json(cResult);
  } catch (error) {
    console.error("Error in /api/reset POST:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});