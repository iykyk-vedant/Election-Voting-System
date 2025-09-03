const API_BASE = "/api";

// Add Candidate
async function addCandidate() {
  const id = document.getElementById("candId").value.trim();
  const name = document.getElementById("candName").value.trim();
  if (!id || !name) {
    document.getElementById("candMsg").textContent = "Enter ID and Name";
    return;
  }

  const res = await fetch(`${API_BASE}/addCandidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name })
  });
  const data = await res.json();
  document.getElementById("candMsg").textContent = data.msg;
  loadCandidates();
}

// Cast Vote
async function castVote() {
  const voterId = document.getElementById("voterId").value.trim();
  const candidateId = document.getElementById("voteCandId").value.trim();
  if (!voterId || !candidateId) {
    document.getElementById("voteMsg").textContent = "Enter Voter ID and Candidate ID";
    return;
  }

  const res = await fetch(`${API_BASE}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId, candidateId })
  });
  const data = await res.json();
  document.getElementById("voteMsg").textContent = data.msg;
  loadVotes();
}

// Load Candidates
async function loadCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  const data = await res.json();
  const list = document.getElementById("candidateList");
  list.innerHTML = "";
  data.candidates.forEach(c => {
    const div = document.createElement("div");
    div.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    list.appendChild(div);
  });
}

// Load Votes
async function loadVotes() {
  const res = await fetch(`${API_BASE}/results`);
  const data = await res.json();
  const list = document.getElementById("voteList");
  list.innerHTML = "";
  if (!data.ok) {
    list.textContent = data.msg;
    return;
  }
  data.results.forEach(c => {
    const div = document.createElement("div");
    div.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    list.appendChild(div);
  });
}

// Find Winner
async function findWinner() {
  const res = await fetch(`${API_BASE}/results`);
  const data = await res.json();
  const winnerBox = document.getElementById("winner");
  if (!data.ok || data.results.length === 0) {
    winnerBox.textContent = "No winner yet.";
    return;
  }
  const maxVotes = Math.max(...data.results.map(c => c.voteCount));
  const winners = data.results.filter(c => c.voteCount === maxVotes && maxVotes > 0);
  if (winners.length === 0) {
    winnerBox.textContent = "No winner yet.";
  } else {
    winnerBox.textContent = winners.map(w => `${w.name} (ID: ${w.id})`).join(", ") + " ← Winner!";
  }
}

// Reset Election
async function resetElection() {
  const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
  const data = await res.json();
  alert(data.msg || "Election reset");
  loadCandidates();
  loadVotes();
  document.getElementById("winner").textContent = "";
}

// Attach Event Listeners
document.getElementById("addBtn").addEventListener("click", addCandidate);
document.getElementById("voteBtn").addEventListener("click", castVote);
document.getElementById("refreshC").addEventListener("click", loadCandidates);
document.getElementById("refreshV").addEventListener("click", loadVotes);
document.getElementById("findWinner").addEventListener("click", findWinner);
document.getElementById("resetBtn").addEventListener("click", resetElection);

// Initial load
loadCandidates();
loadVotes();
