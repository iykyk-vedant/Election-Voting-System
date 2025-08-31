const API_BASE = "/api";

// Add Candidate
async function addCandidate() {
  const id = document.getElementById("candidateId").value.trim();
  const name = document.getElementById("candidateName").value.trim();
  if (!id || !name) return alert("Enter ID and Name");

  const res = await fetch(`${API_BASE}/addCandidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name })
  });
  const data = await res.json();
  alert(data.msg || "Candidate added");
  loadCandidates();
}

// Cast Vote
async function castVote() {
  const voterId = document.getElementById("voterId").value.trim();
  const candidateId = document.getElementById("voteCandidateId").value.trim();
  if (!voterId || !candidateId) return alert("Enter Voter ID and Candidate ID");

  const res = await fetch(`${API_BASE}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId, candidateId })
  });
  const data = await res.json();
  alert(data.msg || "Vote casted");
}

// Load Candidates
async function loadCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  const data = await res.json();
  const list = document.getElementById("candidatesList");
  list.innerHTML = "";
  data.candidates.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    list.appendChild(li);
  });
}

// Load Results
async function loadResults() {
  const res = await fetch(`${API_BASE}/results`);
  const data = await res.json();
  const list = document.getElementById("resultsList");
  list.innerHTML = "";
  if (!data.ok) return alert(data.msg);

  const maxVotes = Math.max(...data.results.map(c => c.voteCount));
  data.results.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    if (c.voteCount === maxVotes && maxVotes > 0) {
      li.style.fontWeight = "bold";
      li.style.color = "green";
      li.textContent += " ← Winner!";
    }
    list.appendChild(li);
  });
}


// Reset Election
async function resetElection() {
  const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
  const data = await res.json();
  alert(data.msg || "Election reset");
  loadCandidates();
  document.getElementById("resultsList").innerHTML = "";
}
