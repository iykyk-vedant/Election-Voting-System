const API_BASE = "http://localhost:5000/api";

// Utility function to show messages
function showMessage(elementId, message, isSuccess = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `msg ${isSuccess ? 'success' : 'error'}`;
    element.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (isSuccess) {
      setTimeout(() => {
        element.style.display = 'none';
      }, 3000);
    }
  }
}

// Utility function to hide messages
function hideMessage(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

// Add Candidate
async function addCandidate() {
  const id = document.getElementById("candId").value.trim();
  const name = document.getElementById("candName").value.trim();
  
  if (!id || !name) {
    showMessage("candMsg", "Please enter both ID and Name", false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), name })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      showMessage("candMsg", "Candidate added successfully!", true);
      document.getElementById("candId").value = "";
      document.getElementById("candName").value = "";
      loadCandidates();
      updateStats();
    } else {
      showMessage("candMsg", data.msg || "Failed to add candidate", false);
    }
  } catch (error) {
    showMessage("candMsg", "Network error: " + error.message, false);
  }
}

// Cast Vote
async function castVote() {
  const voterId = document.getElementById("voterId").value.trim();
  const candidateId = document.getElementById("voteCandId").value.trim();
  
  if (!voterId || !candidateId) {
    showMessage("voteMsg", "Please enter both Voter ID and Candidate ID", false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: parseInt(voterId), candidateId: parseInt(candidateId) })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      showMessage("voteMsg", "Vote recorded successfully!", true);
      document.getElementById("voterId").value = "";
      document.getElementById("voteCandId").value = "";
      loadVotes();
      updateStats();
    } else {
      showMessage("voteMsg", data.msg || "Failed to cast vote", false);
    }
  } catch (error) {
    showMessage("voteMsg", "Network error: " + error.message, false);
  }
}

// Load Candidates
async function loadCandidates() {
  try {
    const res = await fetch(`${API_BASE}/candidates`);
    const data = await res.json();
    
    const list = document.getElementById("candidateList");
    
    if (!Array.isArray(data)) {
      list.innerHTML = "<div class='list-item'>Error loading candidates</div>";
      return;
    }
    
    if (data.length === 0) {
      list.innerHTML = "<div class='list-item'>No candidates available</div>";
      return;
    }
    
    list.innerHTML = data.map(candidate => `
      <div class="list-item">
        <div>
          <strong>${candidate.name}</strong>
          <div>ID: ${candidate.id}</div>
        </div>
        <div class="vote-count">${candidate.votes} votes</div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById("candidateList").innerHTML = 
      `<div class='list-item'>Error loading candidates: ${error.message}</div>`;
  }
}

// Load Votes
async function loadVotes() {
  try {
    const res = await fetch(`${API_BASE}/results`);
    const data = await res.json();
    
    const list = document.getElementById("voteList");
    
    if (!Array.isArray(data)) {
      list.innerHTML = "<div class='list-item'>Error loading results</div>";
      return;
    }
    
    if (data.length === 0) {
      list.innerHTML = "<div class='list-item'>No results available</div>";
      return;
    }
    
    list.innerHTML = data.map(candidate => `
      <div class="list-item">
        <div>
          <strong>${candidate.name}</strong>
          <div>ID: ${candidate.id}</div>
        </div>
        <div class="vote-count">${candidate.votes[0].count} votes</div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById("voteList").innerHTML = 
      `<div class='list-item'>Error loading results: ${error.message}</div>`;
  }
}

// Find Winner
async function findWinner() {
  try {
    const res = await fetch(`${API_BASE}/results`);
    const data = await res.json();
    
    const winnerBox = document.getElementById("winner");
    
    if (!Array.isArray(data)) {
      winnerBox.innerHTML = "Error loading results";
      winnerBox.style.display = 'block';
      return;
    }
    
    if (data.length === 0) {
      winnerBox.innerHTML = "No candidates available";
      winnerBox.style.display = 'block';
      return;
    }
    
    // Find the candidate with the most votes
    let winner = null;
    let maxVotes = -1;
    
    data.forEach(c => {
      const votes = c.votes[0].count;
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = c;
      }
    });
    
    if (winner && maxVotes > 0) {
      winnerBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>🏆 Winner:</strong> ${winner.name} (ID: ${winner.id})
          </div>
          <div class="winner-badge">
            ${maxVotes} votes
          </div>
        </div>
      `;
      winnerBox.style.display = 'block';
    } else {
      winnerBox.innerHTML = "No votes recorded yet.";
      winnerBox.style.display = 'block';
    }
  } catch (error) {
    const winnerBox = document.getElementById("winner");
    winnerBox.innerHTML = `Error finding winner: ${error.message}`;
    winnerBox.style.display = 'block';
  }
}

// Update statistics
async function updateStats() {
  try {
    // Get candidates
    const candidatesRes = await fetch(`${API_BASE}/candidates`);
    const candidates = await candidatesRes.json();
    
    // Get votes
    const votesRes = await fetch(`${API_BASE}/votes`);
    const votes = await votesRes.json();
    
    // Update stats
    document.getElementById("totalCandidates").textContent = Array.isArray(candidates) ? candidates.length : 0;
    
    const totalVotes = Array.isArray(votes) ? votes.length : 0;
    document.getElementById("totalVotes").textContent = totalVotes;
    
    // Simple turnout calculation (assuming each vote is from a unique voter)
    const turnout = totalVotes > 0 ? Math.round((totalVotes / 10) * 100) : 0;
    document.getElementById("voterTurnout").textContent = `${turnout}%`;
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

// Reset Election
async function resetElection() {
  if (!confirm("Are you sure you want to reset the entire election? This cannot be undone.")) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
    const data = await res.json();
    
    if (data.ok) {
      alert("Election reset successfully!");
      loadCandidates();
      loadVotes();
      document.getElementById("winner").style.display = 'none';
      updateStats();
    } else {
      alert("Error resetting election: " + (data.msg || "Unknown error"));
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
}

// Setup real-time listeners
function setupRealtimeListeners() {
  // Initialize Supabase client for real-time updates
  const SUPABASE_URL = "https://iqslfcsssazhwzptusve.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2xmY3Nzc2F6aHd6cHR1c3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTUwNjcsImV4cCI6MjA3MjIzMTA2N30.fDyWzQ-j-bCVzVSrTxiEZoBMekB6HmCwglsLvDpGa44";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Listen for candidate changes
  supabase
    .channel('candidates-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'candidates' }, payload => {
      console.log('Candidate added:', payload);
      loadCandidates();
      updateStats();
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'candidates' }, payload => {
      console.log('Candidate deleted:', payload);
      loadCandidates();
      updateStats();
    })
    .subscribe();

  // Listen for vote changes
  supabase
    .channel('votes-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, payload => {
      console.log('Vote cast:', payload);
      loadVotes();
      updateStats();
    })
    .subscribe();
  
  return supabase;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Check if elements exist before adding event listeners
  const addBtn = document.getElementById("addBtn");
  const voteBtn = document.getElementById("voteBtn");
  const refreshC = document.getElementById("refreshC");
  const refreshV = document.getElementById("refreshV");
  const findWinnerBtn = document.getElementById("findWinner"); // Renamed to avoid conflict
  const resetBtn = document.getElementById("resetBtn");
  
  if (addBtn) addBtn.addEventListener("click", addCandidate);
  if (voteBtn) voteBtn.addEventListener("click", castVote);
  if (refreshC) refreshC.addEventListener("click", loadCandidates);
  if (refreshV) refreshV.addEventListener("click", loadVotes);
  if (findWinnerBtn) findWinnerBtn.addEventListener("click", findWinner); // Use the renamed variable
  if (resetBtn) resetBtn.addEventListener("click", resetElection);
  
  // Initial load
  loadCandidates();
  loadVotes();
  updateStats();
  
  // Setup real-time listeners
  let supabaseClient;
  if (window.supabase) {
    supabaseClient = setupRealtimeListeners();
  }
  
  // Auto-refresh every 30 seconds as fallback
  setInterval(() => {
    loadCandidates();
    loadVotes();
    updateStats();
  }, 30000);
});